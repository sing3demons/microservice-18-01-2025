package model

type Product struct {
	ID          string  `json:"id" bson:"_id"`
	Href        string  `json:"href,omitempty" bson:"-"`
	Name        string  `json:"name,omitempty" bson:"name"`
	Description string  `json:"description,omitempty" bson:"description,omitempty"`
	Price       float64 `json:"price,omitempty" bson:"price,omitempty"`
	Quantity    int     `json:"quantity,omitempty" bson:"quantity,omitempty"`
}
