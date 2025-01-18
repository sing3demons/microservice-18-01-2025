package repository

import (
	"github.com/sing3demons/product-service/db"
	"github.com/sing3demons/product-service/model"
)

type ProductRepository interface {
	Find(findOption db.FindOption) ([]model.Product, error)
	Create(product model.Product) error
}

type productRepository struct {
	datastore db.DataStore[model.Product]
}

func NewProductRepository(datastore db.DataStore[model.Product]) ProductRepository {
	return &productRepository{
		datastore: datastore,
	}
}

func (r *productRepository) Find(findOption db.FindOption) ([]model.Product, error) {
	result := r.datastore.Find(findOption)
	if result.Err != nil {
		return nil, result.Err
	}

	return result.Data, nil
}

func (r *productRepository) Create(product model.Product) error {
	result := r.datastore.Create(product)
	if result.Err != nil {
		return result.Err
	}

	return nil
}
