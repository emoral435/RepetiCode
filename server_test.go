package main

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"log/slog"
)

// mock config with minimal usable values
func getTestRouter() *router {
	return &router{
		config: &config{
			frontendBuildPath: "./testdata/build",
			port:              8080,
			ctx:               context.Background(),
			env: map[string]string{
				"GOOGLE_FIREBASE_API_KEY": "fake_api_key",
			},
			firebaseApp: nil, // Will be nil for now unless mocking FirebaseApp
		},
		logger: slog.Default(),
	}
}

func TestStatusEndpoint(t *testing.T) {
	r := getTestRouter()
	req := httptest.NewRequest("GET", "/status", nil)
	w := httptest.NewRecorder()

	r.Status(w, req)

	resp := w.Result()
	defer func() {
		err := resp.Body.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status 200 but got %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		t.Fatalf("Error decoding response: %v", err)
	}

	if result["message"] != "status ok" {
		t.Errorf("Unexpected message: %v", result["message"])
	}
}

func TestEmailLogin_MalformedRequest(t *testing.T) {
	r := getTestRouter()

	body := strings.NewReader(`{malformed-json}`)
	req := httptest.NewRequest("POST", "/api/v1/login/email", body)
	w := httptest.NewRecorder()

	r.EmailLogin(w, req)

	resp := w.Result()
	defer func() {
		err := resp.Body.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	if resp.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected 500 for bad input, got %d", resp.StatusCode)
	}
}

func TestEmailRegister_BadFirebaseClient(t *testing.T) {
	r := getTestRouter()
	// no firebaseApp = simulated failure when calling Auth

	jsonBody := map[string]string{
		"email":       "test@example.com",
		"password":    "password123",
		"displayname": "Tester",
	}
	bodyBytes, _ := json.Marshal(jsonBody)

	req := httptest.NewRequest("POST", "/api/v1/register/email", bytes.NewReader(bodyBytes))
	w := httptest.NewRecorder()

	r.EmailRegister(w, req)

	resp := w.Result()
	defer func() {
		err := resp.Body.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	if resp.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected 500 for no Firebase client, got %d", resp.StatusCode)
	}
}
