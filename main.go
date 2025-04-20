package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"

	firebase "firebase.google.com/go/v4"
	"google.golang.org/api/option"
)

func main() {
	// create the logger
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	// get our keys from the environment
	env, err := initEnvironmentVariables()
	if err != nil {
		logger.Error(fmt.Errorf("error in trying to get environment variables: %w", err).Error())
		os.Exit(1)
	}

	// initialize firebase app
	opt := option.WithCredentialsFile(env["GOOGLE_APPLICATION_CREDENTIALS"])
	firebaseApp, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		logger.Error(fmt.Errorf("error initializing firebase app: %w", err).Error())
		os.Exit(1)
	}

	// Set port environment variable, given by Railway, to 8080
	cfg := &config{
		frontendBuildPath: "./frontend/dist/",
		port:              8080,
		ctx:               context.Background(),
		env:               env,
		firebaseApp:       firebaseApp,
	}

	// create the server
	srv := &http.Server{
		Addr:     fmt.Sprintf("0.0.0.0:%d", cfg.port),
		Handler:  routes(cfg, logger),
		ErrorLog: slog.NewLogLogger(logger.Handler(), slog.LevelError),
	}

	logger.Info("starting the server", "port", cfg.port, "serving the frontend from the path", cfg.frontendBuildPath)

	// Start the server
	err = srv.ListenAndServe()
	logger.Error(err.Error())
	os.Exit(1)
}
