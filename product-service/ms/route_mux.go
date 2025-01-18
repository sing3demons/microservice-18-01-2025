package ms

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

type muxApplication struct {
	mux         *http.ServeMux
	middlewares []Middleware
	cfg         Config
}

func newMuxServer(cfg Config) IApplication {
	app := http.NewServeMux()

	return &muxApplication{
		mux: app,
		cfg: cfg,
	}
}

func (app *muxApplication) Consume(topic string, h ServiceHandleFunc) error {
	return consume(&app.cfg.KafkaConfig, topic, h)
}

func (app *muxApplication) Use(middlewares ...Middleware) {
	app.middlewares = append(app.middlewares, middlewares...)
}

func (app *muxApplication) Get(path string, handler HandleFunc, middlewares ...Middleware) {
	app.mux.HandleFunc(http.MethodGet+" "+path, func(w http.ResponseWriter, r *http.Request) {
		r = setParam(path, r)
		preHandle(handler, preMiddleware(app.middlewares, middlewares)...)(newMuxContext(w, r, &app.cfg.KafkaConfig))
	})
}

func (app *muxApplication) Post(path string, handler HandleFunc, middlewares ...Middleware) {
	app.mux.HandleFunc(http.MethodPost+" "+path, func(w http.ResponseWriter, r *http.Request) {
		preHandle(handler, preMiddleware(app.middlewares, middlewares)...)(newMuxContext(w, r, &app.cfg.KafkaConfig))
	})
}

func (app *muxApplication) Start() {
	server := http.Server{
		Handler:      app.mux,
		Addr:         ":" + app.cfg.AppConfig.Port,
		WriteTimeout: time.Second * 30,
		ReadTimeout:  time.Second * 10,
	}

	shutdown := make(chan error)

	go func() {
		quit := make(chan os.Signal, 1)

		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		<-quit

		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()

		log.Printf("Shutdown server: %s\n", server.Addr)
		shutdown <- server.Shutdown(ctx)
	}()

	log.Printf("Start server: %s\n", server.Addr)
	err := server.ListenAndServe()
	if !errors.Is(err, http.ErrServerClosed) {
		shutdown <- err
		log.Fatal(err)
	}

	err = <-shutdown
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Server gracefully stopped")
}
