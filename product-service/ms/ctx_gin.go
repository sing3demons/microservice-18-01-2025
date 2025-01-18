package ms

import (
	"fmt"

	"github.com/gin-gonic/gin"
)

type GinContext struct {
	ctx *gin.Context
	cfg *KafkaConfig
}

func newGinContext(c *gin.Context, cfg *KafkaConfig) IContext {
	return &GinContext{ctx: c, cfg: cfg}
}

func (c *GinContext) SendMessage(topic string, message interface{}, opts ...OptionProducerMessage) error {
	p := newProducer(c.cfg.Brokers)
	c.cfg.producer = &p

	err := producer(*c.cfg.producer, topic, message, opts...)
	if err != nil {
		return err
	}

	defer p.Close()

	return nil
}

func (c *GinContext) Log(message string) {
	fmt.Println("Context:", message)
}

func (c *GinContext) Query(name string) string {
	return c.ctx.Query(name)
}

func (c *GinContext) Param(name string) string {
	return c.ctx.Param(name)
}

func (c *GinContext) ReadInput(data interface{}) error {
	return c.ctx.BindJSON(data)
}

func (c *GinContext) Response(responseCode int, responseData interface{}) error {
	c.ctx.JSON(responseCode, responseData)
	return nil
}
