package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strconv"
	"time"
)

type config struct {
	dirPath string
	port    int
}

type application struct {
	config *config
	logger *slog.Logger
}

func (a *application) routes(cfg *config) *http.ServeMux {
	m := http.NewServeMux()
	m.Handle(
		"/",
		http.StripPrefix(
			"/",
			http.FileServer(
				http.Dir(cfg.dirPath), // e.g. "../vue-go/dist"  vue.js's html/css/js build directory
			),
		),
	)

	return m
}

func main() {
	dirPath := "./frontend/dist/"

	// Try to read environment variable for port (given by railway). Otherwise use default
	port := os.Getenv("PORT")
	intPort, err := strconv.Atoi(port)
	if err != nil {
		intPort = 8080
	}

	cfg := &config{
		dirPath,
		intPort,
	}

	// create the logger
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	// create the application
	app := &application{
		config: cfg,
		logger: logger,
	}

	// create the server
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.port),
		Handler:      app.routes(cfg),
		IdleTimeout:  45 * time.Second,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		ErrorLog:     slog.NewLogLogger(logger.Handler(), slog.LevelError),
	}

	logger.Info("server started", "addr", srv.Addr)

	// Start the server
	err = srv.ListenAndServe()
	logger.Error(err.Error())
	os.Exit(1)
}
