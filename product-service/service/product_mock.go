package service

import "github.com/stretchr/testify/mock"

type ProductServiceMock struct {
	mock.Mock
}

func NewProductServiceMock() *ProductServiceMock {
	return &ProductServiceMock{}
}

func (m *ProductServiceMock) Find(filter interface{}) ([]interface{}, error) {
	ret := m.Called(filter)

	var r0 []interface{}
	if rf, ok := ret.Get(0).(func(interface{}) []interface{}); ok {
		r0 = rf(filter)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]interface{})
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
