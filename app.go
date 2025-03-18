package main

import (
	"fmt"
	"log/slog"
	"net/http"
)

// stores configuration information, such as port number, directory path to get to the frontend, and other env variable needed throughout the applications runtime
type config struct {
	frontendBuildPath string
	port              int
}

type Application struct {
	config *config
	Logger *slog.Logger
}

func (a *Application) Routes() *http.ServeMux {
	m := http.NewServeMux()
	m.Handle(
		"/",
		http.StripPrefix(
			"/",
			http.FileServer(
				http.Dir(a.config.frontendBuildPath),
			),
		),
	)

	m.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello!")
	})

	return m
}
