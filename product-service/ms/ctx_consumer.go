package ms

import (
	"encoding/json"
	"fmt"
	"log"
	"reflect"

	"github.com/IBM/sarama"
)

type ConsumerContext struct {
	message string
	msg     *sarama.ConsumerMessage
	cfg     *KafkaConfig
}

func NewConsumerContext(cfg *KafkaConfig, msg *sarama.ConsumerMessage) IContext {
	return &ConsumerContext{
		message: string(msg.Value),
		msg:     msg,
		cfg:     cfg,
	}
}

func (c *ConsumerContext) SendMessage(topic string, message interface{}, opts ...OptionProducerMessage) error {
	p := newProducer(c.cfg.Brokers)
	c.cfg.producer = &p

	err := producer(*c.cfg.producer, topic, message, opts...)
	if err != nil {
		return err
	}

	defer p.Close()

	return nil
}

func (c *ConsumerContext) Log(message string) {
	log.Println("Context:", message)
}

func (c *ConsumerContext) Query(name string) string {
	return ""
}

func (c *ConsumerContext) Param(name string) string {
	return ""
}

func (ctx *ConsumerContext) ReadInput(data interface{}) error {
	const errMsgFormat = "%s, payload: %s"
	val := reflect.ValueOf(&data)
	switch val.Kind() {
	// case reflect.Struct, reflect.Map, reflect.Slice:
	// 	if err := json.Unmarshal([]byte(ctx.message), &data); err != nil {
	// 		return fmt.Errorf(errMsgFormat, err.Error(), ctx.message)
	// 	}
	// 	return nil
	case reflect.Ptr, reflect.Interface:
		if err := json.Unmarshal([]byte(ctx.message), data); err != nil {
			return fmt.Errorf(errMsgFormat, err.Error(), ctx.message)
		}
		return nil
	default:
		err := json.Unmarshal([]byte(ctx.message), &data)
		if err != nil {
			return fmt.Errorf(errMsgFormat, err.Error(), ctx.message)
		}
		return nil
	}
}

func (c *ConsumerContext) Response(responseCode int, responseData interface{}) error {
	fmt.Println("Response:", responseData)
	return nil
}
