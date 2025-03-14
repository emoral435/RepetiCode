package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strconv"
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
	// m.Handle(
	// 	"/",
	// 	http.StripPrefix(
	// 		"/",
	// 		http.FileServer(
	// 			http.Dir(cfg.dirPath), // e.g. "../vue-go/dist"  vue.js's html/css/js build directory
	// 		),
	// 	),
	// )

	m.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello!")
	})

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

	logger.Info("checking static files", "path", cfg.dirPath)
	if _, err := os.Stat(cfg.dirPath); os.IsNotExist(err) {
		logger.Error("static files directory not found", "path", cfg.dirPath)
		os.Exit(1)
	}

	logger.Info("initializing server",
		"port", cfg.port,
		"static_path", cfg.dirPath,
	)

	// create the server
	srv := &http.Server{
		Addr:     fmt.Sprintf("0.0.0.0:%d", cfg.port),
		Handler:  app.routes(cfg),
		ErrorLog: slog.NewLogLogger(logger.Handler(), slog.LevelError),
	}

	logger.Info("server started", "addr", srv.Addr)

	// Start the server
	err = srv.ListenAndServe()
	logger.Error(err.Error())
	os.Exit(1)
}
