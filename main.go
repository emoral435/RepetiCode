package main

import (
	"fmt"
	"log/slog"
	"net/http"
	"os"
)

func main() {
	// Set port environment variable, given by Railway, to 8080
	cfg := &config{
		frontendBuildPath: "./frontend/dist/",
		port:              8080,
	}

	// create the logger
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))
	// create the application after obtaining all configuration settings from the environment
	app := &Application{
		config: cfg,
		Logger: logger,
	}

	// create the server
	srv := &http.Server{
		Addr:     fmt.Sprintf("0.0.0.0:%d", app.config.port),
		Handler:  app.Routes(),
		ErrorLog: slog.NewLogLogger(logger.Handler(), slog.LevelError),
	}

	logger.Info("starting the server", "port", app.config.port, "serving the frontend from the path", cfg.frontendBuildPath)

	// Start the server
	err := srv.ListenAndServe()
	logger.Error(err.Error())
	os.Exit(1)
}
