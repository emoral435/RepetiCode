package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/joho/godotenv"
	"github.com/markbates/goth/gothic"
)

func routes(cfg *config, logger *slog.Logger) *http.ServeMux {
	m := http.NewServeMux()
	r := &router{
		config: cfg,
		logger: logger,
	}

	m.HandleFunc("GET /status", r.Status)

	m.HandleFunc("GET /auth/{provider}/callback", r.AuthCallback)
	m.HandleFunc("GET /auth/{provider}", r.AuthProviderLogin)
	m.HandleFunc("GET /logout/{provider}", r.AuthProviderLogout)

	// catch-all routing solution for serving static React frontend with Go, handling React Router routing cases
	// see: https://stackoverflow.com/a/64687181
	m.HandleFunc("GET /", r.serveFrontend)

	return m
}

// The Routes interface helps us with implementing the routes that our API will serve and handle.
//
// The reasoning behind using an interface for this is to allow us to mock our API tests!
type Routes interface {
	Status(w http.ResponseWriter, r *http.Request)
	AuthCallback(w http.ResponseWriter, r *http.Request)
	AuthProviderLogin(w http.ResponseWriter, r *http.Request)
	AuthProviderLogout(w http.ResponseWriter, r *http.Request)
}

// implements the Routes interface
type router struct {
	config *config
	logger *slog.Logger
}

func (r *router) Status(w http.ResponseWriter, _ *http.Request) {
	response, err := json.Marshal(struct {
		Message string `json:"message"`
		Code    int    `json:"code"`
	}{"status ok", http.StatusOK})

	if err != nil {
		slog.Error("error marshalling status: %w", err.Error(), "")
		w.WriteHeader(http.StatusInternalServerError)
	}

	w.Header().Set("Content-Type", "application/json")
	if _, err = w.Write(response); err != nil {
		slog.Error("error writing response back during status endpoint: %w", err.Error(), "")
		w.WriteHeader(http.StatusInternalServerError)
	}
}

type config struct {
	frontendBuildPath string
	port              int
	ctx               context.Context
	env               map[string]string
}

func (rtr *router) serveFrontend(w http.ResponseWriter, r *http.Request) {
	fs := http.FileServer(http.Dir(rtr.config.frontendBuildPath))
	// If the requested file exists then return if; otherwise return index.html (fileserver default page)
	if r.URL.Path != "/" {
		fullPath := rtr.config.frontendBuildPath + strings.TrimPrefix(path.Clean(r.URL.Path), "/")
		_, err := os.Stat(fullPath)
		if err != nil {
			if !os.IsNotExist(err) {
				panic(err)
			}
			// Requested file does not exist so we return the default (resolves to index.html)
			r.URL.Path = "/"
		}
	}

	fs.ServeHTTP(w, r)
}

func (rtr *router) AuthCallback(w http.ResponseWriter, r *http.Request) {
	provider := r.PathValue("provider")
	//nolint:staticcheck
	r = r.WithContext(context.WithValue(rtr.config.ctx, "provider", provider))
	_, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		rtr.logger.Error(fmt.Sprintf("error trying to authorize user from the %s provider", provider))
		return
	}

	http.Redirect(w, r, "/home", http.StatusTemporaryRedirect)
}
func (rtr *router) AuthProviderLogout(w http.ResponseWriter, r *http.Request) {
	provider := r.PathValue("provider")
	//nolint:staticcheck
	r = r.WithContext(context.WithValue(rtr.config.ctx, "provider", provider))
	if err := gothic.Logout(w, r); err != nil {
		rtr.logger.Error(fmt.Sprintf("error trying to authorize user from the %s provider", provider))
		return
	}

	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}

func (rtr *router) AuthProviderLogin(w http.ResponseWriter, r *http.Request) {
	provider := r.PathValue("provider")
	//nolint:staticcheck
	r = r.WithContext(context.WithValue(rtr.config.ctx, "provider", provider))
	// try to get the user without re-authenticating
	if _, err := gothic.CompleteUserAuth(w, r); err == nil {
		http.Redirect(w, r, "/home", http.StatusTemporaryRedirect)
	} else {
		gothic.BeginAuthHandler(w, r)
	}
}

func initEnvironmentVariables() (map[string]string, error) {
	// if we are in local development mode, then use a package to load the environment variables
	mode := os.Getenv("MODE")
	if mode == "" {
		return nil, fmt.Errorf("error when checking environment variable to indicate which environment mode we are running in: mode=%v", mode)
	}

	if mode == "development" {
		err := godotenv.Load()
		if err != nil {
			return nil, fmt.Errorf("error loading .env file with godotenv: %w", err)
		}
	}

	env := make(map[string]string)
	keys := []string{"MODE", "HASHING_KEY", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
		"GITHUB_CLIENT_ID", "GITHUB_SESSION_SECRET", "RAILWAY_PUBLIC_DOMAIN",
	}

	for _, key := range keys {
		env[key] = os.Getenv(key)
		// ignore all keys that start with RAILWAY, as that denotes that it will be injected into the environment by Railway
		if !strings.HasPrefix(key, "RAILWAY") && env[key] == "" {
			return nil, fmt.Errorf("error in retrieving environment variable key: %s", key)
		}
	}

	return env, nil
}
