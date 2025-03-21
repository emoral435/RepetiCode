package main

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gorilla/sessions"
	"github.com/markbates/goth/gothic"
)

// Setup a test server instance
func setupTestServer() *server {
	store := sessions.NewCookieStore([]byte("fake_key"))
	store.MaxAge(86000 * 7)

	gothic.Store = store

	return &server{
		config: &config{
			frontendBuildPath: "./test_frontend", // Assume test static files exist here
			port:              8080,
			ctx:               context.Background(),
		},
		Logger: nil, // We can mock logging if needed
	}
}

func TestTestingEndpoint(t *testing.T) {
	s := setupTestServer()
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	s.testingEndpoint(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status 200, got %d", resp.StatusCode)
	}
}

func TestAuthProviderLogin(t *testing.T) {
	s := setupTestServer()
	req := httptest.NewRequest(http.MethodGet, "/auth/google", nil)
	w := httptest.NewRecorder()

	s.authProviderLogin(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusBadRequest { // Expecting a 400 code
		t.Errorf("expected redirect status (302), got %d", resp.StatusCode)
	}
}

func TestAuthProviderLogout(t *testing.T) {
	s := setupTestServer()
	req := httptest.NewRequest(http.MethodGet, "/logout/google", nil)
	w := httptest.NewRecorder()

	s.authProviderLogout(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusTemporaryRedirect {
		t.Errorf("expected redirect status, got %d", resp.StatusCode)
	}
}

func TestAuthCallback_Fail(t *testing.T) {
	s := setupTestServer()
	req := httptest.NewRequest(http.MethodGet, "/auth/google/callback", nil)
	w := httptest.NewRecorder()

	s.authCallback(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status 200, got %d", resp.StatusCode)
	}
}

func TestServeFrontend(t *testing.T) {
	// Create a test directory and file for serving frontend
	testDir := "./test_frontend"
	testFile := testDir + "/index.html"
	_ = os.Mkdir(testDir, 0755)
	_ = os.WriteFile(testFile, []byte("<html>Test</html>"), 0644)
	defer os.RemoveAll(testDir)

	s := setupTestServer()
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()

	s.serveFrontend(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status 200, got %d", resp.StatusCode)
	}
}
