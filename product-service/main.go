package main

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/sing3demons/product-service/config"
	"github.com/sing3demons/product-service/db"
	"github.com/sing3demons/product-service/handler"
	"github.com/sing3demons/product-service/model"
	"github.com/sing3demons/product-service/ms"
	"github.com/sing3demons/product-service/repository"
	"github.com/sing3demons/product-service/service"
)

type DbConfig struct {
	Addr         string `env:"DATABASE_DSN" yaml:"addr" json:"addr"`
	Uri          string `env:"DATABASE_URI" yaml:"uri" json:"uri"`
	MaxOpenConns int    `env:"DB_MAX_OPEN_CONNS" default:"10" yaml:"max_open_conns" json:"max_open_conns"`
	MaxIdleConns int    `env:"DB_MAX_IDLE_CONNS" default:"1" yaml:"max_idle_conns" json:"max_idle_conns"`
	MaxIdleTime  int    `default:"10" yaml:"max_idle_time" json:"max_idle_time"`
	Driver       string `env:"DB_DRIVER"`
}

type AppConfig struct {
	Port string   `yaml:"port" default:"8080" json:"port" env:"PORT"`
	Db   DbConfig `yaml:"db" json:"db"`
}

func main() {
	godotenv.Load(".env")
	cfg, err := config.NewAppConfig[AppConfig]("config.yml").Load() //.LoadConfiguration[AppConfig]("config.yml")
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	fmt.Println(cfg)

	client, err := db.NewMongoClient(db.MongoConfig{
		URI:            cfg.Db.Uri,
		Database:       "product",
		MaxPoolSize:    10,
		MinPoolSize:    1,
		ConnectTimeout: 10,
		RetryWrites:    true,
		RetryReads:     true,
	})

	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}

	app := ms.NewApplication(ms.Config{
		AppConfig: ms.AppConfig{
			Port:   cfg.Port,
			Router: ms.Mux,
		},
	})

	Router(app, client)

	app.Start()

}

func Router(app ms.IApplication, client *db.MongoClient) {
	productDb := db.NewMongoDB(model.Product{}, client)
	productRepository := repository.NewProductRepository(productDb)
	productService := service.NewProductService(productRepository)
	productHandler := handler.NewProductHandler(productService)

	app.Get("/products/{id}", productHandler.GetProduct)
	app.Get("/products", productHandler.GetProducts)
	app.Post("/products", productHandler.CreateProduct)
}

type User struct {
	ID    string `json:"id" bson:"_id"`
	Href  string `json:"href,omitempty" bson:"href,omitempty"`
	Name  string `json:"name" bson:"name"`
	Email string `json:"email" bson:"email"`
}

func sql() {
	tx := db.NewDB(User{})

	// err := tx.Create(User{
	// 	ID:    "3",
	// 	Name:  "Sarah Doe",
	// 	Email: "sarah_doe@dev.com",
	// })

	// if err != nil {
	// 	fmt.Println(err)
	// }

	fields := "name,email"
	findOption := db.FindOption{
		Sort: map[string]db.SortDirection{
			"id": db.ASC,
		},
		Projection: fields,
		// Page:  2,
		// Limit: 10,
	}

	// count, err := tx.Count(findOption)

	// fmt.Println(count, err)

	// users, count, err := tx.FindAndCount(findOption)
	result := tx.Find(findOption)
	if result.Err != nil {
		fmt.Println(result.Err)
	}

	for _, user := range result.Data {
		fmt.Println(user)
	}
	fmt.Println(result.Raw)
	// fmt.Println(count)

	fmt.Println("User created successfully")
}
