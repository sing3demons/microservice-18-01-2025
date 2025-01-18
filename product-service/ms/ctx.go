package ms

import "time"

type IContext interface {
	Log(message string)
	Param(name string) string
	Query(name string) string
	ReadInput(data interface{}) error
	Response(responseCode int, responseData interface{}) error

	SendMessage(topic string, message interface{}, opts ...OptionProducerMessage) error
}
type HandleFunc func(ctx IContext) error

type ServiceHandleFunc func(ctx IContext) error

type Middleware func(HandleFunc) HandleFunc

type OptionProducerMessage struct {
	key       string
	headers   []map[string]string
	Timestamp time.Time
	Metadata  interface{}
	Offset    int64
	Partition int32
}
