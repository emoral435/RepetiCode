package auth

import (
	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

const (
	MaxAge = 86400 * 7 // save for 7 days
)

func InitAuth(key, googleClientId, googleClientSecret string) error {
	store := sessions.NewCookieStore([]byte(key))
	store.MaxAge(MaxAge)

	gothic.Store = store
	goth.UseProviders(
		google.New(googleClientId, googleClientSecret, "http://127.0.0.1:8080/auth/google/callback"),
	)

	return nil
}
