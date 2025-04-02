package auth

import (
	"fmt"
	"os"

	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/github"
	"github.com/markbates/goth/providers/google"
)

const (
	MaxAge = 86400 * 7 // save for 7 days
)

func InitAuth(env map[string]string) {
	store := sessions.NewCookieStore([]byte(env["HASHING_KEY"]))
	store.MaxAge(MaxAge)

	gothic.Store = store
	callbackURLS := createCallbackURLS()

	goth.UseProviders(
		google.New(env["GOOGLE_CLIENT_ID"], env["GOOGLE_CLIENT_SECRET"], callbackURLS["google"]),
		github.New(env["GITHUB_CLIENT_ID"], env["GITHUB_SESSION_SECRET"], callbackURLS["github"]),
	)
}

func createCallbackURLS() map[string]string {
	callBackMap := make(map[string]string)
	// choose the right host to redirect to
	var googleCallbackUrl, githubCallbackUrl string

	railwayDomain := os.Getenv("RAILWAY_PUBLIC_DOMAIN")
	if railwayDomain != "" {
		googleCallbackUrl = fmt.Sprintf("https://%s/auth/google/callback", railwayDomain)
		githubCallbackUrl = fmt.Sprintf("https://%s/auth/github/callback", railwayDomain)
	} else {
		googleCallbackUrl = "http://127.0.0.1:8080/auth/google/callback"
		githubCallbackUrl = "http://127.0.0.1:8080/auth/github/callback"
	}

	callBackMap["google"] = googleCallbackUrl
	callBackMap["github"] = githubCallbackUrl
	return callBackMap
}
