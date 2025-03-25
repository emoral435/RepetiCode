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
	env, err := initEnvironmentVariables()
	if err != nil {
		logger.Error(fmt.Errorf("error in trying to get environment variables: %w", err).Error())
		os.Exit(1)
	}

	// Set port environment variable, given by Railway, to 8080
	cfg := &config{
		frontendBuildPath: "./frontend/dist/",
		port:              8080,
		ctx:               context.Background(),
		env:               env,
	}

	// load gothic package with our application-specific configuration
	auth.InitAuth(cfg.env)

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
