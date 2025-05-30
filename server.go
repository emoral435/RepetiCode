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
	"time"

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
	m.HandleFunc("GET /api/v1/user/{uid}/{idToken}", r.GetUserProfileData)
	m.HandleFunc("PUT /api/v1/user/{uid}/{idToken}", r.UpdateUserProfileData)
	m.HandleFunc("POST /api/v1/user/routine/create", r.CreateUserRoutine)
	m.HandleFunc("GET /api/v1/user/routine/{uid}/{idToken}", r.GetAllUserRoutines)
	m.HandleFunc("GET /api/v1/user/routine/single/{routineRefId}/{idToken}", r.GetOneUserRoutine)
	m.HandleFunc("PUT /api/v1/user/routine/single/{routineRefId}/{idToken}", r.UpdateOneUserRoutine)

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

func (r *router) StatusOK(w http.ResponseWriter, httpStatus int, message string, data interface{}) {
	w.WriteHeader(httpStatus)
	err := json.NewEncoder(w).Encode(map[string]interface{}{
		"message": message,
		"data":    data,
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

	tryUser := (&auth.UserToCreate{}).Email(user.Email).Password(user.Password).DisplayName(user.DisplayName)
	createdUser, err := client.CreateUser(rtr.config.ctx, tryUser)
	if err != nil {
		rtr.StatusError(w, http.StatusBadRequest, "register email, bad request", err)
		return
	}

	newUserDocument := &UserDocument{
		UID:         createdUser.UID,
		CurrentGoal: "Unchosen!",
		Metrics: UserDocumentMetrics{
			Height:   0,
			Weight:   0,
			JoinDate: time.Now(),
		},
		Settings: UserDocumentSettings{
			UnitsPreference:  "Metric",
			SubscriptionTier: "Free",
		},
	}

	if err := CreateUserDocument(rtr, newUserDocument); err != nil {
		rtr.StatusError(w, http.StatusInternalServerError, "register email firestore creating new user doc", err)
		return
	}

	arbitratryReturnData := make(map[string]interface{})
	rtr.StatusOK(w, http.StatusOK, "successfully created new user", arbitratryReturnData)
}

func (rtr *router) GetUserProfileData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	uid := r.PathValue("uid")
	idToken := r.PathValue("idToken")

	if err := MintIdToken(rtr, idToken); err != nil {
		rtr.StatusError(w, http.StatusInternalServerError,
			"get user profile data",
			fmt.Errorf("error while trying to mint idToken: %v", err))
		return
	}

	// if the ID token was valid, we return the user based off their UID
	userDoc, err := GetUserDocument(rtr, uid)
	if err != nil {
		rtr.StatusError(w, http.StatusInternalServerError,
			"getting user documents",
			fmt.Errorf("error while trying to get user document: %v", err.Error()))
		return
	}

	rtr.StatusOK(w, http.StatusOK, "successfully retrieved user data", userDoc)
}

func (rtr *router) UpdateUserProfileData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	uid := r.PathValue("uid")
	idToken := r.PathValue("idToken")

	if err := MintIdToken(rtr, idToken); err != nil {
		rtr.StatusError(w, http.StatusInternalServerError,
			"update user profile data",
			fmt.Errorf("error while trying to mint idToken: %v", err))
		return
	}

	// if the ID token was valid, we update the user with the associated uid with what was requested within the PUT body request
	requestedUpdates := make(map[string]interface{})
	if err := json.NewDecoder(r.Body).Decode(&requestedUpdates); err != nil {
		rtr.StatusError(w, http.StatusInternalServerError, "update user document", err)
		return
	}

	if err := UpdateUserDocument(rtr, uid, requestedUpdates); err != nil {
		rtr.StatusError(w, http.StatusInternalServerError,
			"updating user documents",
			fmt.Errorf("error while trying to update user document: %v", err.Error()))
		return
	}

	rtr.StatusOK(w, http.StatusOK, "successfully updated user data", requestedUpdates)
}

type NewUserRoutineRequest struct {
	RoutineName string `json:"routineName"`
	UID         string `json:"uid"`
	IdToken     string `json:"idToken"`
}

func (rtr *router) CreateUserRoutine(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	reqRoutine := &NewUserRoutineRequest{}

	if err := json.NewDecoder(r.Body).Decode(reqRoutine); err != nil {
		rtr.StatusError(w, http.StatusInternalServerError, "create user routine", err)
		return
	}

	if err := MintIdToken(rtr, reqRoutine.IdToken); err != nil {
		rtr.StatusError(w, http.StatusInternalServerError,
			"create user routine",
			fmt.Errorf("error while trying to mint idToken: %v", err))
		return
	}

	if err := CreateRoutineDocument(rtr, reqRoutine.UID, reqRoutine.RoutineName); err != nil {
		rtr.StatusError(w, http.StatusBadRequest,
			"create user routine",
			fmt.Errorf("error while create user routine: %v", err))
		return
	}

	arbitratryReturnData := make(map[string]interface{})
	rtr.StatusOK(w, http.StatusOK, "successfully created new routine for user", arbitratryReturnData)
}

func (rtr *router) GetAllUserRoutines(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	uid := r.PathValue("uid")
	idToken := r.PathValue("idToken")

	if err := MintIdToken(rtr, idToken); err != nil {
		rtr.StatusError(w, http.StatusInternalServerError,
			"getting user routines",
			fmt.Errorf("error while trying to mint idToken while fetching user routines: %v", err))
		return
	}

	routineDocuments, err := GetUserRoutines(rtr, uid)
	if err != nil {
		rtr.StatusError(w, http.StatusInternalServerError,
			"update user profile data",
			fmt.Errorf("error while trying to fetch user routines: %v", err))
		return
	}

	rtr.StatusOK(w, http.StatusOK, "successfully fetched users routines", routineDocuments)
}

func (rtr *router) GetOneUserRoutine(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	routineRefId := r.PathValue("routineRefId")
	idToken := r.PathValue("idToken")

	if err := MintIdToken(rtr, idToken); err != nil {
		rtr.StatusError(w, http.StatusInternalServerError,
			"getting user routines",
			fmt.Errorf("error while trying to mint idToken while fetching user routines: %v", err))
		return
	}

	routineDocumentData, err := GetOneUserRoutine(rtr, routineRefId)
	if err != nil {
		rtr.StatusError(w, http.StatusInternalServerError,
			"getting one user routine",
			fmt.Errorf("error while trying to fetch one user routine with associated routine id (%s): %v", routineRefId, err))
		return
	}

	rtr.StatusOK(w, http.StatusOK, "successfully fetched users routines", routineDocumentData)
}

func (rtr *router) UpdateOneUserRoutine(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	routineRefId := r.PathValue("routineRefId")
	idToken := r.PathValue("idToken")

	if err := MintIdToken(rtr, idToken); err != nil {
		rtr.StatusError(w, http.StatusInternalServerError,
			"getting user routines",
			fmt.Errorf("error while trying to mint idToken while fetching user routines: %v", err))
		return
	}

	// if the ID token was valid, we update the user's routine with the new routine data
	requestedUpdates := make(map[string]interface{})
	if err := json.NewDecoder(r.Body).Decode(&requestedUpdates); err != nil {
		rtr.StatusError(w, http.StatusInternalServerError, "update user document", err)
		return
	}

	if err := UpdateOneUserRoutine(rtr, routineRefId, requestedUpdates); err != nil {
		rtr.StatusError(w, http.StatusInternalServerError,
			"updating user's routine documents",
			fmt.Errorf("error while trying to update user's routine document: %v", err.Error()))
		return
	}

	rtr.StatusOK(w, http.StatusOK, "successfully updated user's routine data", requestedUpdates)
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
