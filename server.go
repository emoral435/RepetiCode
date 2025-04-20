package main

import (
	"bytes"
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

type NewUserEmailAuthRequest struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	DisplayName string `json:"displayname"`
}

type CheckUserEmailAuthRequest struct {
	Email             string `json:"email"`
	Password          string `json:"password"`
	ReturnSecureToken bool   `json:"returnSecureToken"`
}

type FirebaseAuthResponseOk struct {
	Email        string `json:"email"`
	DisplayName  string `json:"displayName"`
	Registered   bool   `json:"registered"`
	RefreshToken string `json:"refreshToken"`
	IdToken      string `json:"idToken"`
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
	w.Header().Set("Content-Type", "application/json")
	userRequest := &CheckUserEmailAuthRequest{}

	if err := json.NewDecoder(r.Body).Decode(userRequest); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		err = json.NewEncoder(w).Encode(map[string]string{
			"error": "error unmarshalling clients request to authenticate using email login credentials",
		})

		if err != nil {
			rtr.logger.Error("error while json encoding an error during unmarshalling clients request to authenticate using email login credentials")
		}

		return
	}

	req, err := json.Marshal(userRequest)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		err = json.NewEncoder(w).Encode(map[string]string{
			"error": "error marshalling clients request to authenticate using email login credentials",
		})

		if err != nil {
			rtr.logger.Error("error while json encoding an error during unmarshalling clients request to login using email login credentials")
		}

		return
	}

	googleOAuthEndpoint := fmt.Sprintf("https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=%s", rtr.config.env["GOOGLE_FIREBASE_API_KEY"])
	gAuthResponse, err := http.Post(googleOAuthEndpoint, "application/json", bytes.NewBuffer(req))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		err = json.NewEncoder(w).Encode(map[string]string{
			"error": fmt.Sprintf("error calling google oauth endpoint to check users sign in credentials: %v", err.Error()),
		})

		if err != nil {
			rtr.logger.Error("error while json encoding an error during google oauth endpoint checking for user sign in credentials")
		}

		return
	}

	if gAuthResponse.StatusCode != 200 {
		w.WriteHeader(http.StatusBadRequest)
		err = json.NewEncoder(w).Encode(map[string]string{
			"error": "error returned while cross referencing user input credentials with what is stored on firebase",
		})

		if err != nil {
			rtr.logger.Error("error while json encoding an error during cross referencing user input credentials with what is stored on firebase")
		}

		return
	}

	fbAuthRes := &FirebaseAuthResponseOk{}
	if err := json.NewDecoder(gAuthResponse.Body).Decode(fbAuthRes); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		err = json.NewEncoder(w).Encode(map[string]string{
			"error": fmt.Sprintf("error unmarshalling gAuth's response: %v", err.Error()),
		})

		if err != nil {
			rtr.logger.Error("error while json encoding an error during unmarshalling gAuth's response")
		}

		return
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(map[string]string{
		"message":     "successfully logged in user",
		"idToken":     fbAuthRes.IdToken,
		"email":       fbAuthRes.Email,
		"displayname": fbAuthRes.DisplayName,
	})

	if err != nil {
		rtr.logger.Error("error while json encoding success message while going through email login route")
	}
}

func (rtr *router) EmailRegister(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	user := &NewUserEmailAuthRequest{}
	if err := json.NewDecoder(r.Body).Decode(user); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		err = json.NewEncoder(w).Encode(map[string]string{
			"error": fmt.Sprintf("error marshalling clients request while registering email: %v", err.Error()),
		})

		if err != nil {
			rtr.logger.Error("error while json encoding an error during marshalling clients request while registering email")
		}

		return
	}

	if rtr.config.firebaseApp == nil {
		w.WriteHeader(http.StatusInternalServerError)
		err := json.NewEncoder(w).Encode(map[string]string{
			"error": "error while trying to register new user, firebaseApp is not initialized",
		})

		if err != nil {
			rtr.logger.Error("error while json encoding an error while trying to register new user, firebaseApp is not initialized")
		}

		return
	}

	client, err := rtr.config.firebaseApp.Auth(rtr.config.ctx)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		err1 := json.NewEncoder(w).Encode(map[string]string{
			"error": fmt.Sprintf("error getting auth client when trying to make new user from email, error: %v", err.Error()),
		})

		if err1 != nil {
			rtr.logger.Error("error while json encoding an error auth client when trying to make new user from email")
		}

		return
	}

	newUser := (&auth.UserToCreate{}).Email(user.Email).Password(user.Password).DisplayName(user.DisplayName)
	if _, err = client.CreateUser(rtr.config.ctx, newUser); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		err = json.NewEncoder(w).Encode(map[string]string{
			"error": fmt.Sprintf("error trying to make user: %s", err.Error()),
		})

		if err != nil {
			rtr.logger.Error("error while json encoding an error trying to make user")
		}

		return
	}

	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(map[string]string{
		"message": "successfully created new user",
	})

	if err != nil {
		rtr.logger.Error("error while json encoding success message while going through email register route")
	}
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
