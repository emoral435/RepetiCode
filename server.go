package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/markbates/goth/gothic"
)

// stores configuration information, such as port number, directory path to get to the frontend, and other env variable needed throughout the applications runtime
type config struct {
	frontendBuildPath string
	port              int
	ctx               context.Context
}

type server struct {
	config *config
	Logger *slog.Logger
}

// Routes defines the routes that our API will serve.
//
// Routes will serve our static HTML frontend files, built from React.
// To see more route information, see:
func (s *server) Routes() *http.ServeMux {
	m := http.NewServeMux()

	// catch-all routing solution for serving static React frontend with Go, handling React Router routing cases
	// see: https://stackoverflow.com/a/64687181
	m.HandleFunc("GET /test", s.testingEndpoint)

	m.HandleFunc("GET /auth/{provider}/callback", s.authCallback)
	m.HandleFunc("GET /auth/{provider}", s.authProviderLogin)
	m.HandleFunc("GET /logout/{provider}", s.authProviderLogout)

	m.HandleFunc("GET /", s.serveFrontend)

	return m
}

func (s *server) testingEndpoint(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Testing!")
}

func (s *server) serveFrontend(w http.ResponseWriter, r *http.Request) {
	fs := http.FileServer(http.Dir(s.config.frontendBuildPath))
	// If the requested file exists then return if; otherwise return index.html (fileserver default page)
	if r.URL.Path != "/" {
		fullPath := s.config.frontendBuildPath + strings.TrimPrefix(path.Clean(r.URL.Path), "/")
		_, err := os.Stat(fullPath)
		if err != nil {
			if !os.IsNotExist(err) {
				panic(err)
			}
			// Requested file does not exist so we return the default (resolves to index.html)
			r.URL.Path = "/"
		}
	}

	fs.ServeHTTP(w, r)
}

func (s *server) authCallback(w http.ResponseWriter, r *http.Request) {
	provider := r.PathValue("provider")
	r = r.WithContext(context.WithValue(s.config.ctx, "provider", provider))
	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		fmt.Fprintln(w, err)
		return
	}
	fmt.Println(user)

	http.Redirect(w, r, "/register", http.StatusTemporaryRedirect)
}
func (s *server) authProviderLogout(w http.ResponseWriter, r *http.Request) {
	provider := r.PathValue("provider")
	r = r.WithContext(context.WithValue(s.config.ctx, "provider", provider))
	gothic.Logout(w, r)
	http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
}

func (s *server) authProviderLogin(w http.ResponseWriter, r *http.Request) {
	provider := r.PathValue("provider")
	r = r.WithContext(context.WithValue(s.config.ctx, "provider", provider))
	// try to get the user without re-authenticating
	if user, err := gothic.CompleteUserAuth(w, r); err == nil {
		fmt.Println(user)
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
	} else {
		gothic.BeginAuthHandler(w, r)
	}
}
