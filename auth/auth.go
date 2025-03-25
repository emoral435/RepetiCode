package auth

import (
	"fmt"
	"os"

	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/google"
)

const (
	MaxAge = 86400 * 7 // save for 7 days
)

func InitAuth(key, googleClientId, googleClientSecret string) error {
	if key == "" {
		return fmt.Errorf("missing required key environment variable: HASHING_KEY: %s", key)
	} else if googleClientId == "" {
		return fmt.Errorf("missing required key environment variable: GOOGLE_CLIENT_ID: %s", googleClientId)
	} else if googleClientSecret == "" {
		return fmt.Errorf("missing required key environment variable: GOOGLE_CLIENT_SECRET: %s", googleClientSecret)
	}

	store := sessions.NewCookieStore([]byte(key))
	store.MaxAge(MaxAge)

	gothic.Store = store

	// choose the right host to redirect to
	var googleCallbackUrl string
	railwayDomain := os.Getenv("RAILWAY_PUBLIC_DOMAIN")
	if railwayDomain != "" {
		googleCallbackUrl = fmt.Sprintf("https://%s/auth/google/callback", railwayDomain)
	} else {
		googleCallbackUrl = "http://127.0.0.1:8080/auth/google/callback"
	}

	fmt.Printf("Our callback URL is: %s", googleCallbackUrl)

	goth.UseProviders(
		google.New(googleClientId, googleClientSecret, googleCallbackUrl),
	)

	return nil
}
