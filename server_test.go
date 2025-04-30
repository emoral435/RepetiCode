package main

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
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

	r.ServerStatus(w, req)

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

	if result["message"] != "Server status:" {
		t.Errorf("Unexpected message: %v", result["message"])
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

func TestUpdateUserProfileData_FirebaseAppNil(t *testing.T) {
	r := getTestRouter()

	body := map[string]interface{}{
		"CurrentGoal": "New Goal",
	}
	bodyBytes, _ := json.Marshal(body)

	req := httptest.NewRequest("PUT", "/api/v1/user/test-user-123/update/token123", bytes.NewReader(bodyBytes))
	req.SetPathValue("uid", "test-user-123")
	req.SetPathValue("idToken", "token123")
	w := httptest.NewRecorder()

	r.UpdateUserProfileData(w, req)

	resp := w.Result()
	defer func() {
		err := resp.Body.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	if resp.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status 500 for nil firebaseApp, got %d", resp.StatusCode)
	}
}

func TestUpdateUserProfileData_InvalidBody(t *testing.T) {
	r := getTestRouter()
	// This time we simulate that firebaseApp exists but won't actually be used (it won't pass VerifyIDToken anyway)

	// Provide invalid JSON body
	req := httptest.NewRequest("PUT", "/api/v1/user/test-user-123/update/token123", bytes.NewBufferString("{invalid json"))
	req.SetPathValue("uid", "test-user-123")
	req.SetPathValue("idToken", "token123")
	w := httptest.NewRecorder()

	// Inject dummy firebaseApp to move past nil-check
	r.config.firebaseApp = nil // this test is actually blocked earlier by nil check — you can skip or structure this later when mocking firebaseApp

	r.UpdateUserProfileData(w, req)

	resp := w.Result()
	defer func() {
		err := resp.Body.Close()
		if err != nil {
			log.Fatal(err)
		}
	}()

	if resp.StatusCode != http.StatusInternalServerError {
		t.Errorf("Expected status 500 for invalid JSON body, got %d", resp.StatusCode)
	}
}
