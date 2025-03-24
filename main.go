package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"

	"github.com/emoral435/repeticode/auth"
)

func main() {
	// create the logger
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	// get our keys from the environment
	key := os.Getenv("HASHING_KEY")
	googleClientId := os.Getenv("GOOGLE_CLIENT_ID")
	googleClientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")

	if err := auth.InitAuth(key, googleClientId, googleClientSecret); err != nil {
		logger.Error(fmt.Errorf("error in trying to init auth: %w", err).Error())
		os.Exit(1)
	}

	// Set port environment variable, given by Railway, to 8080
	cfg := &config{
		frontendBuildPath: "./frontend/dist/",
		port:              8080,
		ctx:               context.Background(),
	}

	// create the application after obtaining all configuration settings from the environment
	sv := &server{
		config: cfg,
		Logger: logger,
	}

	// create the server
	srv := &http.Server{
		Addr:     fmt.Sprintf("0.0.0.0:%d", sv.config.port),
		Handler:  sv.Routes(),
		ErrorLog: slog.NewLogLogger(logger.Handler(), slog.LevelError),
	}

	logger.Info("starting the server", "port", sv.config.port, "serving the frontend from the path", cfg.frontendBuildPath)

	// Start the server
	err := srv.ListenAndServe()
	logger.Error(err.Error())
	os.Exit(1)
}
