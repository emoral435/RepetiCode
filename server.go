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

	m.HandleFunc("GET /status", r.ServerStatus)

	m.HandleFunc("POST /api/v1/register/email", r.EmailRegister)

	// catch-all routing solution for serving static React frontend with Go, handling React Router routing cases
	// see: https://stackoverflow.com/a/64687181
	m.HandleFunc("GET /", r.ServeFrontend)

	return m
}

// implements the Routes interface
type router struct {
	config *config
	logger *slog.Logger
}

func (r *router) StatusOK(w http.ResponseWriter, httpStatus int, message string) {
	w.WriteHeader(httpStatus)
	err := json.NewEncoder(w).Encode(map[string]string{
		"message": message,
	})

	if err != nil {
		errMsg := fmt.Sprintf("error returning json marshalling for the following success message: %s", message)
		r.logger.Error(errMsg)
	}
}

func (r *router) StatusError(w http.ResponseWriter, httpStatus int, endpointPathDescriptor string, rootErr error) {
	w.WriteHeader(httpStatus)
	err := json.NewEncoder(w).Encode(map[string]string{
		"error": fmt.Sprintf("error marshalling clients request during API path %s: %v", endpointPathDescriptor, rootErr.Error()),
	})

	if err != nil {
		errMsg := fmt.Sprintf("error while json encoding in endpoint path: %s", endpointPathDescriptor)
		r.logger.Error(errMsg)
	}
}

func (r *router) ServerStatus(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response, err := json.Marshal(struct {
		Message string `json:"message"`
		Code    int    `json:"code"`
	}{"Server status:", http.StatusOK})

	if err != nil {
		slog.Error("error marshalling status: %w", err.Error(), "")
		w.WriteHeader(http.StatusInternalServerError)
	}

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

type NewUserEmailAuthRequest struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	DisplayName string `json:"displayname"`
}

type FirebaseAuthResponseOk struct {
	Email        string `json:"email"`
	DisplayName  string `json:"displayName"`
	Registered   bool   `json:"registered"`
	RefreshToken string `json:"refreshToken"`
	IdToken      string `json:"idToken"`
}

func (rtr *router) ServeFrontend(w http.ResponseWriter, r *http.Request) {
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

func (rtr *router) EmailRegister(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	user := &NewUserEmailAuthRequest{}

	if err := json.NewDecoder(r.Body).Decode(user); err != nil {
		rtr.StatusError(w, http.StatusInternalServerError, "register email", err)
		return
	}

	if rtr.config.firebaseApp == nil {
		rtr.StatusError(w, http.StatusInternalServerError,
			"register email, firebaseApp is not initialized",
			fmt.Errorf("firebaseApp is not initialized"))
		return
	}

	client, err := rtr.config.firebaseApp.Auth(rtr.config.ctx)
	if err != nil {
		rtr.StatusError(w, http.StatusInternalServerError, "register new user from email", err)
		return
	}

	newUser := (&auth.UserToCreate{}).Email(user.Email).Password(user.Password).DisplayName(user.DisplayName)
	if _, err = client.CreateUser(rtr.config.ctx, newUser); err != nil {
		rtr.StatusError(w, http.StatusBadRequest, "register email, bad request", err)
		return
	}

	rtr.StatusOK(w, http.StatusOK, "successfully created new user")
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
	keys := []string{"MODE", "GOOGLE_APPLICATION_CREDENTIALS", "GOOGLE_FIREBASE_API_KEY", "RAILWAY_PUBLIC_DOMAIN"}

	for _, key := range keys {
		env[key] = os.Getenv(key)
		// ignore all keys that start with RAILWAY, as that denotes that it will be injected into the environment by Railway
		if !strings.HasPrefix(key, "RAILWAY") && env[key] == "" {
			return nil, fmt.Errorf("error in retrieving environment variable key: %s", key)
		}
	}

	return env, nil
}
