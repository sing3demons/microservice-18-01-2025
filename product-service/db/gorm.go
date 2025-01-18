package db

import (
	"fmt"
	"reflect"
	"strings"
	"sync"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type gormDb[T any] struct {
	db *gorm.DB
}

func NewDB[T any](model T) DataStore[T] {
	dsn := "postgresql://postgres:password@localhost:5432/banking?sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		panic(err)
	}

	db.AutoMigrate(&model)

	return &gormDb[T]{
		db: db,
	}
}

func (tx *gormDb[T]) getQuery(str string) string {
	// return fmt.Sprintf("%s = ?", str)
	return str + " = ?"
}

func (tx *gormDb[T]) Find(findOption ...FindOption) Result[[]T] {
	// var results Result[T]
	results := Result[[]T]{
		Err: nil,
	}
	var queries []string
	var args []interface{}
	var projection []string
	var order []string
	var limit int = 10
	var offset int

	if len(findOption) > 0 {
		for _, option := range findOption {
			for _, filter := range option.Filter {
				queries = append(queries, tx.getQuery(filter.Key))
				args = append(args, filter.Value)
			}

			if option.Limit > 0 {
				limit = option.Limit
			}

			if option.Page > 0 {
				offset = (option.Page - 1) * option.Limit
			}

			if option.Projection != "" {
				for _, field := range strings.Split(option.Projection, ",") {
					projection = append(projection, field)
				}
			}

			// if option.Projection != nil {
			// 	reflectValue := reflect.Indirect(reflect.ValueOf(option.Projection))
			// 	switch reflectValue.Kind() {
			// 	case reflect.Map:
			// 		for _, key := range reflectValue.MapKeys() {
			// 			projection = append(projection, key.String())
			// 		}
			// 	}
			// }

			if option.Sort != nil {
				for k, v := range option.Sort {
					if v == ASC {
						order = append(order, fmt.Sprintf("%s ASC", k))
					} else {
						order = append(order, fmt.Sprintf("%s DESC", k))
					}
				}
			}
		}
	}

	query := strings.Join(queries, " AND ")

	tableName := tx.db.Statement.Table
	if tableName == "" {
		var model T
		stmt := &gorm.Statement{DB: tx.db}
		stmt.Parse(model)

		tableName = stmt.Schema.Table
	}

	command := "SELECT * FROM model"
	command = strings.Replace(command, "model", fmt.Sprintf("%s", tableName), 1)

	if query != "" {
		command = fmt.Sprint(command, " WHERE ", query)
	}

	if len(args) > 0 {
		// for loop to replace ? with args
		for _, arg := range args {
			command = strings.Replace(command, "?", fmt.Sprintf("'%v'", arg), 1)
		}
	}

	if len(projection) > 0 {
		command = strings.Replace(command, "*", strings.Join(projection, ", "), 1)
	}

	if len(order) > 0 {
		command = fmt.Sprintf("%s ORDER BY %s", command, strings.Join(order, ", "))
	}

	if limit > 0 {
		command = fmt.Sprintf("%s LIMIT %d", command, limit)
	}

	if offset > 0 {
		command = fmt.Sprintf("%s OFFSET %d", command, offset)
	}

	results.Raw = command
	if err := tx.db.Where(query, args...).Select(projection).Order(strings.Join(order, " ")).Limit(limit).Offset(offset).Find(&results.Data).Error; err != nil {
		results.Err = err
		return results
	}

	return results

}

func (tx *gormDb[T]) FindAndCount(findOption ...FindOption) Result[[]T] {
	result := Result[[]T]{
		Err: nil,
	}

	var wg sync.WaitGroup

	wg.Add(2)

	go func() {
		defer wg.Done()
		data := tx.Find(findOption...)
		result.Raw = data.Raw
		result.Data = data.Data
		result.Err = data.Err
	}()

	// Query for count
	go func() {
		defer wg.Done()
		countData := tx.Count(findOption...)
		result.Count = countData.Count
		result.Raw = result.Raw + ";\n" + countData.Raw
		result.Err = countData.Err
	}()

	wg.Wait()

	return result
}

func (tx *gormDb[T]) Create(model T) Result[T] {
	results := Result[T]{
		Err: nil,
	}

	command := "INSERT INTO model (fields) VALUES (values)"
	tableName := tx.db.Statement.Table
	if tableName == "" {
		var model T
		stmt := &gorm.Statement{DB: tx.db}
		stmt.Parse(model)
		tableName = stmt.Schema.Table
	}

	command = strings.Replace(command, "model", fmt.Sprintf("%s", tableName), 1)

	var fields []string
	var values []string

	reflectValue := reflect.Indirect(reflect.ValueOf(model))
	switch reflectValue.Kind() {
	case reflect.Struct:
		for i := 0; i < reflectValue.NumField(); i++ {
			fields = append(fields, reflectValue.Type().Field(i).Name)
			values = append(values, fmt.Sprintf("'%v'", reflectValue.Field(i).Interface()))
		}
	}

	command = strings.Replace(command, "fields", strings.ToLower(strings.Join(fields, ", ")), 1)
	command = strings.Replace(command, "values", strings.Join(values, ", "), 1)

	results.Raw = command

	if err := tx.db.Create(model).Error; err != nil {
		results.Err = err
		return results
	}

	results.Data = model

	return results
}

func (tx *gormDb[T]) Count(findOption ...FindOption) Result[int64] {
	var queries []string
	var args []interface{}

	var result Result[int64]

	if len(findOption) > 0 {
		for _, option := range findOption {
			for _, filter := range option.Filter {
				queries = append(queries, fmt.Sprintf("%s = ?", filter.Key))
				args = append(args, filter.Value)
			}
		}
	}

	query := strings.Join(queries, " AND ")

	var model T
	tableName := tx.db.Statement.Table
	if tableName == "" {
		stmt := &gorm.Statement{DB: tx.db}
		stmt.Parse(model)
		tableName = stmt.Schema.Table
	}

	command := "SELECT count(*) FROM model"
	command = strings.Replace(command, "model", fmt.Sprintf("%s", tableName), 1)

	if query != "" {
		command = fmt.Sprintf("%s WHERE %s", command, query)
	}

	if len(args) > 0 {
		for _, arg := range args {
			command = strings.Replace(command, "?", fmt.Sprintf("'%v'", arg), 1)
		}
	}

	if err := tx.db.Table(tableName).Where(query, args...).Count(&result.Count).Error; err != nil {
		result.Err = err
		return result
	}

	result.Raw = command
	return result
}

func (tx *gormDb[T]) FindOne(findOption ...FindOption) Result[T] {
	var (
		result     Result[T]
		queries    []string
		args       []interface{}
		projection []string
	)

	if len(findOption) > 0 {
		for _, option := range findOption {
			for _, filter := range option.Filter {
				queries = append(queries, fmt.Sprintf("%s = ?", filter.Key))
				args = append(args, filter.Value)
			}

			// if option.Projection != nil {
			// 	reflectValue := reflect.Indirect(reflect.ValueOf(option.Projection))
			// 	switch reflectValue.Kind() {
			// 	case reflect.Map:
			// 		for _, key := range reflectValue.MapKeys() {
			// 			projection = append(projection, key.String())
			// 		}
			// 	}
			// }

			if option.Projection != "" {
				for _, field := range strings.Split(option.Projection, ",") {
					projection = append(projection, field)
				}
			}
		}
	}

	tableName := tx.db.Statement.Table
	if tableName == "" {
		var model T
		stmt := &gorm.Statement{DB: tx.db}
		stmt.Parse(model)

		tableName = stmt.Schema.Table
	}

	command := "SELECT * FROM model"
	command = strings.Replace(command, "model", fmt.Sprintf("%s", tableName), 1)

	query := strings.Join(queries, " AND ")

	if query != "" {
		command = fmt.Sprint(command, " WHERE ", query)
	}

	if len(args) > 0 {
		// for loop to replace ? with args
		for _, arg := range args {
			command = strings.Replace(command, "?", fmt.Sprintf("'%v'", arg), 1)
		}
	}

	if len(projection) > 0 {
		command = strings.Replace(command, "*", strings.Join(projection, ", "), 1)
	}

	if err := tx.db.Where(query, args...).Select(projection).First(&result.Data).Error; err != nil {
		result.Err = err
		return result
	}

	command = fmt.Sprintf("%s ORDER BY id LIMIT 1", command)

	result.Raw = command
	return result
}

func (tx *gormDb[T]) Update(filter interface{}, update T) error {
	var query interface{}
	var args []interface{}
	if f, err := filter.(map[string]interface{}); err {
		for k, v := range f {
			query = k
			args = append(args, v)
		}
	}

	if err := tx.db.Where(query, args...).Save(update).Error; err != nil {
		return err
	}
	return nil
}

func (tx *gormDb[T]) Delete(filter interface{}) error {
	var query interface{}
	var args []interface{}
	if f, err := filter.(map[string]interface{}); err {
		for k, v := range f {
			query = k
			args = append(args, v)
		}
	}

	var result T

	if err := tx.db.Where(query, args...).Delete(&result).Error; err != nil {
		return err
	}
	return nil
}
