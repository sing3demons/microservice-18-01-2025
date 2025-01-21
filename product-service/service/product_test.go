package service_test

import (
	"net/http"
	"testing"

	"github.com/sing3demons/product-service/model"
	"github.com/sing3demons/product-service/repository"
	"github.com/sing3demons/product-service/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestProductServiceFindOne(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		productRepositoryMock := repository.NewProductRepositoryMock()

		expectedProduct := model.Product{
			ID:       "1",
			Name:     "Product1",
			Price:    100,
			Quantity: 10,
		}

		productRepositoryMock.On("FindOne", mock.Anything).Return(expectedProduct, nil)

		productService := service.NewProductService(productRepositoryMock)

		filter := "1"
		result := productService.FindOne(filter)
		assert.NotNil(t, result.Data)
	})

	t.Run("Error", func(t *testing.T) {
		productRepositoryMock := repository.NewProductRepositoryMock()

		productRepositoryMock.On("FindOne", mock.Anything).Return(nil, assert.AnError)

		productService := service.NewProductService(productRepositoryMock)

		filter := "1"
		result := productService.FindOne(filter)
		assert.Equal(t, http.StatusNotFound, result.Status)
		assert.Equal(t, false, result.Success)
	})
}

func TestProductServiceFind(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		productRepositoryMock := repository.NewProductRepositoryMock()

		expectedProducts := []model.Product{{
			ID:       "1",
			Name:     "Product 1",
			Price:    100,
			Quantity: 10,
		}}

		productRepositoryMock.On("Find", mock.Anything).Return(expectedProducts, nil)

		productService := service.NewProductService(productRepositoryMock)

		filter := "Product"
		fields := "name,price"
		result := productService.Find(filter, fields)
		assert.NotNil(t, result.Data)
	})

	t.Run("Error", func(t *testing.T) {
		productRepositoryMock := repository.NewProductRepositoryMock()

		productRepositoryMock.On("Find", mock.Anything).Return(nil, assert.AnError)

		productService := service.NewProductService(productRepositoryMock)

		filter := "Product"
		fields := "name,price"
		result := productService.Find(filter, fields)
		assert.Nil(t, result.Data)
	})
}

func TestProductServiceCreate(t *testing.T) {
	t.Run("Success", func(t *testing.T) {
		productRepositoryMock := repository.NewProductRepositoryMock()

		product := model.Product{
			ID:       "1",
			Name:     "Product 1",
			Price:    100,
			Quantity: 10,
		}

		productRepositoryMock.On("Create", product).Return(nil)

		productService := service.NewProductService(productRepositoryMock)

		response := productService.Create(product)

		assert.True(t, response.Success)
		assert.Equal(t, http.StatusCreated, response.Status)
	})

	t.Run("Error", func(t *testing.T) {
		productRepositoryMock := repository.NewProductRepositoryMock()

		product := model.Product{}

		productRepositoryMock.On("Create", mock.Anything).Return(assert.AnError)

		productService := service.NewProductService(productRepositoryMock)

		response := productService.Create(product)

		assert.False(t, response.Success)
		assert.Equal(t, http.StatusInternalServerError, response.Status)

	})
}
