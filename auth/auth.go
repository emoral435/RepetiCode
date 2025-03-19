package auth

import (
	"fmt"

	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

const (
	MaxAge = 86400 * 7 // save for 7 days
)

func InitAuth(env map[string]string) error {
	key, ok := env["HASHING_KEY"]
	if !ok {
		return fmt.Errorf("error in getting the hashing key: %v", ok)
	}

	googleClientId, ok := env["GOOGLE_CLIENT_ID"]
	if !ok {
		return fmt.Errorf("error in getting the google client id: %v", ok)
	}

	googleClientSecret, ok := env["GOOGLE_CLIENT_SECRET"]
	if !ok {
		return fmt.Errorf("error in getting the google client secret: %v", ok)
	}

	store := sessions.NewCookieStore([]byte(key))
	store.MaxAge(MaxAge)

	gothic.Store = store
	goth.UseProviders(
		google.New(googleClientId, googleClientSecret, "http://127.0.0.1:8080/auth/google/callback"),
	)

	return nil
}
