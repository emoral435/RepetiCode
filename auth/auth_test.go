package auth

import (
	"os"
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

func TestInitAuth_Success(t *testing.T) {
	setupEnv()
	defer clearEnv()

	err := InitAuth()
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

	err := InitAuth()
	if err == nil || err.Error() != "error in getting the hashing key, key detected as: " {
		t.Fatalf("Expected error due to missing HASHING_KEY, got: %v", err)
	}
}

func TestInitAuth_MissingGoogleClientId(t *testing.T) {
	clearEnv()
	os.Setenv("HASHING_KEY", "testhashingkey")
	os.Setenv("GOOGLE_CLIENT_SECRET", "testclientsecret")

	err := InitAuth()
	if err == nil || err.Error() != "error in getting the google client id, found: " {
		t.Fatalf("Expected error due to missing GOOGLE_CLIENT_ID, got: %v", err)
	}
}

func TestInitAuth_MissingGoogleClientSecret(t *testing.T) {
	clearEnv()
	os.Setenv("HASHING_KEY", "testhashingkey")
	os.Setenv("GOOGLE_CLIENT_ID", "testclientid")

	err := InitAuth()
	if err == nil || err.Error() != "error in getting the google client secret, found: " {
		t.Fatalf("Expected error due to missing GOOGLE_CLIENT_SECRET, got: %v", err)
	}
}
