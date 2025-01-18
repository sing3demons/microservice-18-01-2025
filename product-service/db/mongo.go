package db

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"reflect"
	"strings"
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/event"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type mongDb[T any] struct {
	db     *mongo.Collection
	config MongoConfig
}

type MongoConfig struct {
	URI            string
	Database       string
	MaxPoolSize    uint64
	MinPoolSize    uint64
	ConnectTimeout time.Duration
	RetryWrites    bool
	RetryReads     bool
}

type MongoClient struct {
	db     *mongo.Client
	config MongoConfig
}

func NewMongoClient(config MongoConfig) (*MongoClient, error) {

	monitor := &event.CommandMonitor{
		Started: func(ctx context.Context, evt *event.CommandStartedEvent) {
			var commandMap map[string]interface{}
			if err := bson.Unmarshal(evt.Command, &commandMap); err != nil {
				log.Printf("Error unmarshaling command BSON: %v", err)
				return
			}

			// Convert the decoded map to a JSON string for logging
			commandJSON, err := json.MarshalIndent(commandMap, "", "  ")
			if err != nil {
				log.Printf("Error converting command map to JSON: %v", err)
				return
			}

			fmt.Println(string(commandJSON))

		},
	}
	// lopts := &options.LoggerOptions{}
	clientOptions := options.Client().
		ApplyURI(config.URI).
		SetMaxPoolSize(config.MaxPoolSize).
		SetMinPoolSize(config.MinPoolSize).
		SetRetryWrites(config.RetryWrites).
		SetRetryReads(config.RetryReads).SetMonitor(monitor)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(clientOptions)
	if err != nil {
		return nil, err
	}

	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	return &MongoClient{
		db:     client,
		config: config,
	}, nil
}

func NewMongoDB[T any](model T, client *MongoClient) DataStore[T] {
	collectionName := strings.ToLower(reflect.TypeOf(model).Name())
	collection := client.db.Database(client.config.Database).Collection(collectionName)
	return &mongDb[T]{
		db:     collection,
		config: client.config,
	}
}

func (tx *mongDb[T]) Find(findOption ...FindOption) Result[[]T] {
	collectionName := tx.db.Name()
	method := "find"

	model := getModel(collectionName, method)

	filter := bson.M{}
	projection := bson.M{}
	if len(findOption) > 0 {
		for _, option := range findOption {
			for _, f := range option.Filter {
				filter[f.Key] = f.Value
			}

			if option.Projection != "" {
				for _, field := range strings.Split(option.Projection, ",") {
					projection[field] = 1
				}
			}
		}
	}

	rawDataFilter, _ := json.Marshal(filter)
	rawData := fmt.Sprintf("%s(%s", model, strings.ReplaceAll(string(rawDataFilter), "\"", "'"))

	if len(projection) > 0 {
		rawDataProjection, _ := json.Marshal(projection)
		rawData += fmt.Sprintf(", %s", strings.ReplaceAll(string(rawDataProjection), "\"", "'"))
	}

	rawData += ")"

	// var results Result[T]
	results := Result[[]T]{
		Err: nil,
		Raw: rawData,
	}
	// var queries []Filter

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	opts := &options.FindOptionsBuilder{}

	if len(projection) > 0 {
		opts.SetProjection(projection)
	}

	cursor, err := tx.db.Find(ctx, filter, opts)
	if err != nil {
		results.Err = err
		return results
	}

	var data []T
	for cursor.Next(ctx) {
		var model T
		if err := cursor.Decode(&model); err != nil {
			results.Err = err
			return results
		}
		data = append(data, model)
	}

	results.Data = data

	return results
}

func (tx *mongDb[T]) Count(findOption ...FindOption) Result[int64] {
	return Result[int64]{
		Err:   nil,
		Count: 0,
	}
}

func getModel(name, method string) string {
	return fmt.Sprintf("db.%s.%s", name, method)
}

func (tx *mongDb[T]) Create(model T) Result[T] {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result := Result[T]{
		Err: nil,
	}

	cmd := "InsertOne"
	collectionName := tx.db.Name()

	v := reflect.ValueOf(&model).Elem()

	idField := v.FieldByName("ID")
	if idField.Kind() == reflect.String && idField.String() == "" {

		idField.SetString(uuid.New().String())
	}

	if !idField.IsValid() {
		idField.SetString(uuid.New().String())
	}

	if idField.IsZero() {
		idField.SetString(uuid.New().String())
	}

	m := getModel(collectionName, cmd)
	rawDataNew, _ := json.Marshal(model)
	rawDataStr := strings.ReplaceAll(string(rawDataNew), "\"", "'")

	rawData := fmt.Sprintf("%s(%s", m, rawDataStr)
	rawData += ")"

	result.Raw = rawData

	_, err := tx.db.InsertOne(ctx, &model)
	if err != nil {
		result.Err = err
		return result
	}

	// val := reflect.ValueOf(&model).Elem()
	// if val.Kind() == reflect.Struct {
	// 	field := val.FieldByName("_id")
	// 	if !field.IsValid() {
	// 		fmt.Println("Field not found", insertOneResult.InsertedID)
	// 		field.Set(reflect.ValueOf(insertOneResult.InsertedID))
	// 	}
	// }

	result.Data = model
	return result
}

func (tx *mongDb[T]) FindOne(findOption ...FindOption) Result[T] {
	result := Result[T]{
		Err: nil,
	}

	return result
}

func (tx *mongDb[T]) Update(filter interface{}, update T) error {
	return nil
}

func (tx *mongDb[T]) FindAndCount(findOption ...FindOption) Result[[]T] {
	return Result[[]T]{
		Err: nil,
	}
}
