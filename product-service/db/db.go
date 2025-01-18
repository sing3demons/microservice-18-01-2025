package db

type DataStore[T any] interface {
	Find(findOption ...FindOption) Result[[]T]
	Count(findOption ...FindOption) Result[int64]
	Create(model T) Result[T]
	FindOne(findOption ...FindOption) Result[T]
	Update(filter interface{}, update T) error
	FindAndCount(findOption ...FindOption) Result[[]T]
}

type Result[T any] struct {
	Err   error
	Count int64
	Data  T
	Raw   string
}

type Filter struct {
	Key   string
	Value interface{}
}

// enum for sort direction
type SortDirection int

const (
	ASC SortDirection = iota
	DESC
)

type FindOption struct {
	Filter     []Filter
	Page       int
	Limit      int
	Projection string
	Sort       map[string]SortDirection
}
