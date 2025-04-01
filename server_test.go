package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/stretchr/testify/assert"
)

var fakeEnvironmentVariables = map[string]string{
	"MODE":                  "production",
	"HASHING_KEY":           "test_hashing_key",
	"GOOGLE_CLIENT_ID":      "test_google_client_id",
	"GOOGLE_CLIENT_SECRET":  "test_google_client_id",
	"GITHUB_CLIENT_ID":      "test_github_client_id",
	"GITHUB_SESSION_SECRET": "test_github_session_secret",
	"RAILWAY_PUBLIC_DOMAIN": "",
}

func TestInitEnvironmentVariables_Success(t *testing.T) {
	// Set mock environment variables
	for key, val := range fakeEnvironmentVariables {
		err := os.Setenv(key, val)
		assert.NoError(t, err, fmt.Errorf("error should not be present setting environment variable %s: %w", key, err))
	}

	// Ensure cleanup after test
	defer os.Clearenv()

	env, err := initEnvironmentVariables()

	// Ensure no error occurred
	assert.NoError(t, err, "initEnvironmentVariables should not return an error")

	for key := range fakeEnvironmentVariables {
		assert.Contains(t, env, key, fmt.Sprintf("env map should contain key: %s", key))
		if !strings.HasPrefix(key, "RAILWAY") {
			assert.NotEmpty(t, env[key], fmt.Sprintf("env[%s] should not be empty", key))
		}
	}
}

func TestInitEnvironmentVariables_MissingNonRailwayVariable(t *testing.T) {
	// Set environment variables but leave out a required one
	fakeEnvironmentVariables["RAILWAY_PUBLIC_DOMAIN"] = "railway.example.com"
	fakeEnvironmentVariables["GITHUB_CLIENT_ID"] = ""
	for key, val := range fakeEnvironmentVariables {
		err := os.Setenv(key, val)
		assert.NoError(t, err, fmt.Errorf("error should not be present setting environment variable %s: %w", key, err))
	}
	defer func() {
		os.Clearenv()
		fakeEnvironmentVariables["GITHUB_CLIENT_ID"] = "test_github_client_id"
	}()

	env, err := initEnvironmentVariables()

	// Should return an error because a required variable is missing
	assert.Error(t, err, "initEnvironmentVariables should return an error when a required variable is missing")
	assert.Nil(t, env, "env should be nil when a required variable is missing")
}

func TestInitEnvironmentVariables_IgnoreMissingRailwayVariable(t *testing.T) {
	// Set environment variables without RAILWAY_PUBLIC_DOMAIN
	delete(fakeEnvironmentVariables, "RAILWAY_PUBLIC_DOMAIN")
	for key, val := range fakeEnvironmentVariables {
		err := os.Setenv(key, val)
		assert.NoError(t, err, fmt.Errorf("error should not be present setting environment variable %s: %w", key, err))
	}

	defer os.Clearenv()

	env, err := initEnvironmentVariables()

	// Should still succeed, since RAILWAY_PUBLIC_DOMAIN is optional
	assert.NoError(t, err, "initEnvironmentVariables should not return an error when RAILWAY_PUBLIC_DOMAIN is missing")
	assert.Contains(t, env, "RAILWAY_PUBLIC_DOMAIN", "env should contain RAILWAY_PUBLIC_DOMAIN even if empty")
	assert.Empty(t, env["RAILWAY_PUBLIC_DOMAIN"], "RAILWAY_PUBLIC_DOMAIN should be empty but present in env map")
}

func TestAuthCallback_Success(t *testing.T) {
	// Mock gothic to return a successful auth
	gothic.CompleteUserAuth = func(w http.ResponseWriter, r *http.Request) (goth.User, error) {
		return goth.User{}, nil
	}

	r := &router{config: &config{ctx: context.Background()}}

	req := httptest.NewRequest(http.MethodGet, "/auth/callback/provider", nil)
	w := httptest.NewRecorder()

	r.AuthCallback(w, req)

	assert.Equal(t, http.StatusTemporaryRedirect, w.Code, "Expected 307 Temporary Redirect")
	assert.Equal(t, "/home", w.Header().Get("Location"), "Should redirect to /home")
}

func TestAuthProviderLogin_Success(t *testing.T) {
	// Mock gothic to return a successful auth
	gothic.CompleteUserAuth = func(w http.ResponseWriter, r *http.Request) (goth.User, error) {
		return goth.User{}, nil
	}

	r := &router{config: &config{ctx: context.Background()}}

	req := httptest.NewRequest(http.MethodGet, "/auth/login/provider", nil)
	w := httptest.NewRecorder()

	r.AuthProviderLogin(w, req)

	assert.Equal(t, http.StatusTemporaryRedirect, w.Code, "Expected 307 Temporary Redirect")
	assert.Equal(t, "/home", w.Header().Get("Location"), "Should redirect to /home")
}
