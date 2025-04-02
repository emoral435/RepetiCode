package auth

import (
	"os"
	"testing"

	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/stretchr/testify/assert"
)

func TestInitAuth(t *testing.T) {
	// Mock environment variables
	mockEnv := map[string]string{
		"HASHING_KEY":           "test_hashing_key",
		"GOOGLE_CLIENT_ID":      "test_google_client_id",
		"GOOGLE_CLIENT_SECRET":  "test_google_client_secret",
		"GITHUB_CLIENT_ID":      "test_github_client_id",
		"GITHUB_SESSION_SECRET": "test_github_session_secret",
	}

	// Call InitAuth
	InitAuth(mockEnv)

	// Verify session store is set
	store, ok := gothic.Store.(*sessions.CookieStore)
	assert.True(t, ok, "gothic.Store should be a *sessions.CookieStore")
	assert.NotNil(t, store, "Session store should not be nil")

	// Verify that providers are correctly registered
	providers := goth.GetProviders()
	assert.Contains(t, providers, "google", "Google provider should be registered")
	assert.Contains(t, providers, "github", "GitHub provider should be registered")
}

func TestCreateCallbackURLSRailway(t *testing.T) {
	// Mock environment variables, alongside the railway environment variable
	err := os.Setenv("RAILWAY_PUBLIC_DOMAIN", "test.example.com")
	assert.NoError(t, err, "setting environment variable RAILWAY_PUBLIC_DOMAIN should not fail")
	defer func() {
		err = os.Unsetenv("RAILWAY_PUBLIC_DOMAIN")
		assert.NoError(t, err, "cleaning environment variable RAILWAY_PUBLIC_DOMAIN should not fail")
	}()

	// run the function
	cbMap := createCallbackURLS()

	assert.NotNil(t, cbMap, "our callback map should not be empty, or not created")

	assert.Equal(t, cbMap["google"], "https://test.example.com/auth/google/callback", "our callback map should be configuring the callback host url correclty")
	assert.Contains(t, cbMap["github"], "github", "https://test.example.com/auth/github/callback")
}

func TestCreateCallbackURLSLocal(t *testing.T) {
	// run the function, with no railway env variables
	cbMap := createCallbackURLS()

	assert.NotNil(t, cbMap, "our callback map should not be empty, or not created")

	assert.Equal(t, cbMap["google"], "http://127.0.0.1:8080/auth/google/callback", "our callback map should be configuring the callback host url correclty")
	assert.Contains(t, cbMap["github"], "github", "http://127.0.0.1:8080/auth/github/callback")
}
