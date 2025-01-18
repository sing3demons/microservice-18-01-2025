package handler

import (
	"github.com/sing3demons/product-service/model"
	"github.com/sing3demons/product-service/ms"
	"github.com/sing3demons/product-service/service"
)

type ProductHandler interface {
	GetProducts(ctx ms.IContext) error
	CreateProduct(ctx ms.IContext) error
}

type productHandler struct {
	service service.ProductService
}

func NewProductHandler(service service.ProductService) ProductHandler {
	return &productHandler{service: service}
}

func (h *productHandler) GetProducts(ctx ms.IContext) error {
	fields := ctx.Query("fields")
	filter := ctx.Query("search")

	result := h.service.Find(filter, fields)
	ctx.Response(result.Status, result)
	return nil
}

func (h *productHandler) CreateProduct(ctx ms.IContext) error {
	product := model.Product{}
	err := ctx.ReadInput(&product)
	if err != nil {
		ctx.Response(400, err)
		return nil
	}

	result := h.service.Create(product)
	ctx.Response(result.Status, result)
	return nil
}
