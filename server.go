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

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"github.com/joho/godotenv"
)

func routes(cfg *config, logger *slog.Logger) *http.ServeMux {
	m := http.NewServeMux()
	r := &router{
		config: cfg,
		logger: logger,
	}

	m.HandleFunc("GET /status", r.Status)

	m.HandleFunc("POST /api/v1/login/email", r.EmailLogin)
	m.HandleFunc("POST /api/v1/register/email", r.EmailRegister)

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
	EmailLogin(w http.ResponseWriter, r *http.Request)
	EmailRegister(w http.ResponseWriter, r *http.Request)
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
	firebaseApp       *firebase.App
}

type UserEmailAuthRequest struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	DisplayName string `json:"displayname"`
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

func (rtr *router) EmailLogin(w http.ResponseWriter, r *http.Request) {
	user := &UserEmailAuthRequest{}
	json.NewDecoder(r.Body).Decode(user)

	_, err := rtr.config.firebaseApp.Auth(rtr.config.ctx)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "error getting auth client when trying to make new use from email",
		})
		return
	}
}

func (rtr *router) EmailRegister(w http.ResponseWriter, r *http.Request) {
	user := &UserEmailAuthRequest{}
	json.NewDecoder(r.Body).Decode(user)

	client, err := rtr.config.firebaseApp.Auth(rtr.config.ctx)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "error getting auth client when trying to make new use from email",
		})
		return
	}

	newUser := (&auth.UserToCreate{}).Email(user.Email).Password(user.Password).DisplayName(user.DisplayName)

	res, err := client.CreateUser(rtr.config.ctx, newUser)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": fmt.Sprintf("error trying to make user: %s", err.Error()),
		})
		return
	}

	w.WriteHeader(200)
	fmt.Fprintf(w, res.DisplayName)
}

func initEnvironmentVariables() (map[string]string, error) {
	// if we are in local development mode, then use a package to load the environment variables
	mode := os.Getenv("MODE")
	if mode == "development" || mode == "" {
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
