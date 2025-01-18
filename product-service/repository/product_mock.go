package repository

import (
	"github.com/sing3demons/product-service/db"
	"github.com/sing3demons/product-service/model"
	"github.com/stretchr/testify/mock"
)

type ProductRepositoryMock struct {
	mock.Mock
}

func NewProductRepositoryMock() *ProductRepositoryMock {
	return &ProductRepositoryMock{}
}

func (m *ProductRepositoryMock) Find(filter db.FindOption) ([]model.Product, error) {
	ret := m.Called(filter)

	var r0 []model.Product
	if rf, ok := ret.Get(0).(func(interface{}) []model.Product); ok {
		r0 = rf(filter)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]model.Product)
		}
	}

	var r1 error
	if rf, ok := ret.Get(1).(func(interface{}) error); ok {
		r1 = rf(filter)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

func (m *ProductRepositoryMock) Create(product model.Product) error {
	ret := m.Called(product)

	var r0 error
	if rf, ok := ret.Get(0).(func(model.Product) error); ok {
		r0 = rf(product)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}
