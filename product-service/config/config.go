package config

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"reflect"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
	"gopkg.in/yaml.v3"
)

// type env func(key string) string

type cfg struct {
	// getEnv env
}

type Server struct {
	Port int
}

type Config struct {
	Server Server
	Db     DbConfig
}

type DbConfig struct {
	Addr         string
	MaxOpenConns int
	MaxIdleConns int
	MaxIdleTime  string
	Driver       string
}

func New() *cfg {
	return &cfg{}
}

func (c *cfg) Load(filenames ...string) Config {

	if len(filenames) > 0 {
		godotenv.Load(filenames...)
	}

	return Config{
		Server: Server{
			Port: c.getPort(),
		},
		Db: DbConfig{
			Addr: c.getEnv("DATABASE_DSN"),
			// MaxOpenConns: c.getMaxOpenConns(),
			// MaxIdleConns: c.getMaxIdleConns(),
			// MaxIdleTime:  c.getMaxIdleTime(),
			// Driver:       c.getEnv("DB_DRIVER"),
		},
	}
}

func (c *cfg) getEnv(key string) string {
	return os.Getenv(key)
}

func (c *cfg) getPort() int {
	port := os.Getenv("PORT")
	if port == "" {
		return 8080
	}

	portInt, err := strconv.Atoi(port)
	if err != nil {
		return 8080
	}

	return portInt
}

type AppConfig[T any] struct {
	AppConfig  T
	configPath []string
}

func NewAppConfig[T any](configPath ...string) *AppConfig[T] {
	return &AppConfig[T]{
		configPath: configPath,
	}
}

func (c *AppConfig[T]) Load() (*T, error) {
	cfg, err := LoadConfiguration[T](c.configPath[0])
	if err != nil {
		return nil, err
	}

	return cfg, nil
}

func (c *AppConfig[T]) loadConfiguration() error {
	if c.configPath == nil {

		for _, path := range c.configPath {
			LoadConfiguration[T](path)
		}
	}
	return nil
}

func LoadConfiguration[T any](configPath string) (*T, error) {
	var config T
	file, err := os.ReadFile(configPath)
	if err != nil {
		if os.IsNotExist(err) {
			_, err = os.Create(configPath)
			if err != nil {
				return nil, err
			}

			setDefaults(&config)
			jsonContent, err := json.MarshalIndent(config, "", "  ")
			if err != nil {
				return nil, err
			}
			err = os.WriteFile(configPath, []byte(jsonContent), 0644)
			if err != nil {
				return nil, err
			}

			file, err = os.ReadFile(configPath)
			if err != nil {
				return nil, err
			}
		}
	}

	expandedYaml, err := expandEnvironmentVariables(file)
	if err != nil {
		return nil, err
	}

	err = unmarshalAndValidate([]byte(expandedYaml), &config)
	if err != nil {
		return nil, err
	}

	loadEnvAndDefaults(&config)

	return &config, nil
}

func loadEnvAndDefaults(config interface{}) {
	val := reflect.ValueOf(config).Elem()
	typ := val.Type()

	for i := 0; i < val.NumField(); i++ {
		field := val.Field(i)
		fieldType := typ.Field(i)

		// Handle nested structs
		if field.Kind() == reflect.Struct {
			loadEnvAndDefaults(field.Addr().Interface())
			continue
		}

		// Load from environment variable
		envKey := fieldType.Tag.Get("env")
		if envKey != "" {
			envValue := os.Getenv(envKey)
			if envValue != "" {
				setFieldValue(field, envValue)
				continue
			}
		}
	}
}

// setFieldValue sets a value to a field based on its type
func setFieldValue(field reflect.Value, value string) {
	switch field.Kind() {
	case reflect.Int:
		if intValue, err := strconv.Atoi(value); err == nil {
			field.SetInt(int64(intValue))
		}
	case reflect.String:
		field.SetString(value)
	}
}

func setDefaults(obj interface{}) {
	val := reflect.ValueOf(obj).Elem()
	typ := val.Type()

	for i := 0; i < val.NumField(); i++ {
		field := val.Field(i)

		// Handle nested structs
		if field.Kind() == reflect.Struct {
			setDefaults(field.Addr().Interface())
			continue
		}

		tag := typ.Field(i).Tag.Get("default")
		if tag != "" && field.IsZero() {
			switch field.Kind() {
			case reflect.Int:
				field.SetInt(int64(parseInt(tag)))
			case reflect.String:
				field.SetString(tag)
			}
		}
	}
}

func parseInt(s string) int {
	var i int
	fmt.Sscanf(s, "%d", &i)
	return i
}

func expandEnvironmentVariables(file []byte) (string, error) {
	fileText := string(file)

	var missingKeys []string
	expandedYaml := os.Expand(fileText, func(key string) string {
		expanded := os.Getenv(key)
		if expanded == "" {
			missingKeys = append(missingKeys, key)
		}
		return expanded
	})

	if len(missingKeys) != 0 {
		errorMessage := "Missing required environment variables: " + strings.Join(missingKeys, ",")
		return "", errors.New(errorMessage)
	}
	return expandedYaml, nil
}

func unmarshalAndValidate(data []byte, out interface{}) error {
	var fieldsMap map[string]interface{}
	if err := yaml.Unmarshal(data, &fieldsMap); err != nil {
		return err
	}

	if err := yaml.Unmarshal(data, out); err != nil {
		return err
	}

	if err := json.Unmarshal(data, &out); err != nil {
		return err
	}

	return validateFields(reflect.ValueOf(out).Elem(), fieldsMap, "")
}

func validateFields(val reflect.Value, fieldsMap map[string]interface{}, prefix string) error {
	valType := val.Type()
	for i := 0; i < val.NumField(); i++ {
		field := valType.Field(i)
		yamlTag := field.Tag.Get("yaml")
		required, hasRequiredTag := field.Tag.Lookup("required")

		yamlPath := yamlTag
		if prefix != "" {
			yamlPath = prefix + "." + yamlTag
		}

		if _, found := fieldsMap[yamlTag]; !found && hasRequiredTag && required == "true" {
			return fmt.Errorf("required field '%s' is missing in YAML input", yamlPath)
		}

		if field.Type.Kind() == reflect.Struct {
			nestedFieldsMap, ok := fieldsMap[yamlTag].(map[string]interface{})
			if !ok {
				nestedFieldsMap = make(map[string]interface{}) // Handle case where the nested struct is not in the map
			}
			if err := validateFields(val.Field(i), nestedFieldsMap, yamlPath); err != nil {
				return err
			}
		}
	}
	return nil
}
