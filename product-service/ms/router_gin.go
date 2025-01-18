package ms

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-gonic/gin"
)

func newGinServer(cfg Config) IApplication {
	r := gin.Default()
	return &ginApplication{router: r, cfg: cfg}
}

type ginApplication struct {
	router      *gin.Engine
	middlewares []Middleware
	cfg         Config
}

func (app *ginApplication) Consume(topic string, h ServiceHandleFunc) error {
	return consume(&app.cfg.KafkaConfig, topic, h)
}

func (app *ginApplication) Get(path string, handler HandleFunc, middlewares ...Middleware) {
	app.router.GET(path, func(c *gin.Context) {
		preHandle(handler, preMiddleware(app.middlewares, middlewares)...)(newGinContext(c, &app.cfg.KafkaConfig))
	})
}

func (app *ginApplication) Post(path string, handler HandleFunc, middlewares ...Middleware) {
	app.router.POST(path, func(c *gin.Context) {
		preHandle(handler, preMiddleware(app.middlewares, middlewares)...)(newGinContext(c, &app.cfg.KafkaConfig))
	})
}

func (app *ginApplication) Use(middlewares ...Middleware) {
	app.middlewares = append(app.middlewares, middlewares...)
}

func (app *ginApplication) Start() {
	srv := http.Server{
		Addr:    ":" + app.cfg.AppConfig.Port,
		Handler: app.router,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	shutdown := make(chan os.Signal, 1)
	signal.Notify(shutdown, os.Interrupt, syscall.SIGTERM)

	<-shutdown
	fmt.Println("shutting down...")
	if err := srv.Shutdown(context.Background()); err != nil {
		fmt.Println("shutdown err:", err)
		log.Fatal(err)
	}
	fmt.Println("bye bye")
}
