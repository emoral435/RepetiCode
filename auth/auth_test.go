package auth

import (
	"os"
	"strings"
	"testing"

	"github.com/gorilla/sessions"
	"github.com/markbates/goth/gothic"
)

func setupEnv() {
	os.Setenv("HASHING_KEY", "testhashingkey")
	os.Setenv("GOOGLE_CLIENT_ID", "testclientid")
	os.Setenv("GOOGLE_CLIENT_SECRET", "testclientsecret")
}

func clearEnv() {
	os.Unsetenv("HASHING_KEY")
	os.Unsetenv("GOOGLE_CLIENT_ID")
	os.Unsetenv("GOOGLE_CLIENT_SECRET")
}

func getEnvs() []string {
	envs := []string{}
	return append(envs, os.Getenv("HASHING_KEY"), os.Getenv("GOOGLE_CLIENT_ID"), os.Getenv("GOOGLE_CLIENT_SECRET"))
}

func TestInitAuth_Success(t *testing.T) {
	setupEnv()
	defer clearEnv()

	envs := getEnvs()
	err := InitAuth(envs[0], envs[1], envs[2])
	if err != nil {
		t.Fatalf("InitAuth failed: %v", err)
	}

	// Check if the session store was set correctly
	if gothic.Store == nil {
		t.Fatal("Expected gothic.Store to be initialized, but it is nil")
	}

	// Check if the session store is a CookieStore
	if _, ok := gothic.Store.(*sessions.CookieStore); !ok {
		t.Fatal("Expected gothic.Store to be of type *sessions.CookieStore")
	}
}

func TestInitAuth_MissingHashingKey(t *testing.T) {
	clearEnv()
	os.Setenv("GOOGLE_CLIENT_ID", "testclientid")
	os.Setenv("GOOGLE_CLIENT_SECRET", "testclientsecret")

	envs := getEnvs()
	err := InitAuth("", envs[1], envs[2])
	if err == nil || !strings.Contains(err.Error(), "missing required key environment variable: HASHING_KEY") {
		t.Fatalf("Expected error due to missing HASHING_KEY, got: %v", err)
	}
}

func TestInitAuth_MissingGoogleClientId(t *testing.T) {
	clearEnv()
	os.Setenv("HASHING_KEY", "testhashingkey")
	os.Setenv("GOOGLE_CLIENT_SECRET", "testclientsecret")

	envs := getEnvs()
	err := InitAuth(envs[0], "", envs[1])
	if err == nil || !strings.Contains(err.Error(), "missing required key environment variable: GOOGLE_CLIENT_ID") {
		t.Fatalf("Expected error due to missing GOOGLE_CLIENT_ID, got: %v", err)
	}
}

func TestInitAuth_MissingGoogleClientSecret(t *testing.T) {
	clearEnv()
	os.Setenv("HASHING_KEY", "testhashingkey")
	os.Setenv("GOOGLE_CLIENT_ID", "testclientid")

	envs := getEnvs()
	err := InitAuth(envs[0], envs[1], "")
	if err == nil || !strings.Contains(err.Error(), "missing required key environment variable: GOOGLE_CLIENT_SECRET") {
		t.Fatalf("Expected error due to missing GOOGLE_CLIENT_SECRET, got: %v", err)
	}
}
