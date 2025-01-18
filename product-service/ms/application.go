package ms

import (
	"github.com/IBM/sarama"
)

type IApplication interface {
	Get(path string, handler HandleFunc, middlewares ...Middleware)
	Post(path string, handler HandleFunc, middlewares ...Middleware)
	Use(middlewares ...Middleware)
	Start()

	Consume(topic string, h ServiceHandleFunc) error
}

type AppConfig struct {
	Port   string
	Router Router
}

type Config struct {
	AppConfig   AppConfig
	KafkaConfig KafkaConfig
}

// enum Router {gin, mux}

type Router int

const (
	Gin Router = iota
	Mux
	Fiber
)

type KafkaConfig struct {
	Brokers     []string
	GroupID     string
	exitChannel chan bool

	client   sarama.ConsumerGroup
	producer *sarama.SyncProducer
}

func NewApplication(cfg Config) IApplication {
	switch cfg.AppConfig.Router {
	case Gin:
		return newGinServer(cfg)
	case Mux:
		return newMuxServer(cfg)
	default:
		return newMuxServer(cfg)
	}
}
