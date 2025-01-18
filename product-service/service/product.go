package service

import (
	"net/http"

	"github.com/sing3demons/product-service/db"
	"github.com/sing3demons/product-service/model"
	"github.com/sing3demons/product-service/repository"
)

type ProductService interface {
	Find(filter interface{}, fields interface{}) Response
	Create(product model.Product) Response
}

type productService struct {
	repo repository.ProductRepository
}

func NewProductService(repo repository.ProductRepository) ProductService {
	return &productService{
		repo: repo,
	}
}

type Response struct {
	Success bool            `json:"success"`
	Status  int             `json:"status"`
	Message string          `json:"message"`
	Data    []model.Product `json:"data"`
}

func (s *productService) Find(filter, fields interface{}) Response {
	result := Response{
		Success: false,
		Status:  500,
	}

	options := db.FindOption{}

	if filter != nil {
		if filter != "" {
			options.Filter = []db.Filter{
				{
					Key:   "name",
					Value: filter,
				},
			}
		}
	}

	if fields != nil {
		// convert fields to string
		field, ok := fields.(string)
		if ok {
			options.Projection = field
		}
	}

	products, err := s.repo.Find(options)
	if err != nil {
		result.Message = err.Error()
		return result
	}

	productsResponse := []model.Product{}
	for _, product := range products {
		product.Href = "/products/" + product.ID
		productsResponse = append(productsResponse, product)
	}

	result.Success = true
	result.Status = 200
	result.Message = "Success"
	result.Data = productsResponse

	return result
}

func (s *productService) Create(product model.Product) Response {
	result := Response{
		Success: false,
		Status:  500,
	}

	err := s.repo.Create(product)
	if err != nil {
		result.Message = err.Error()
		return result
	}

	result.Success = true
	result.Status = http.StatusCreated
	result.Message = "Success"
	result.Data = []model.Product{product}

	return result
}
