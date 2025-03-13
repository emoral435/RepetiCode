package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func main() {
	fmt.Println("Hello, World! Starting new HTTP server... on port uhhh")

	m := http.NewServeMux()
	directoryPath := "./frontend/dist/"

	port := ""
	if os.Getenv("PORT") == "" {
		port = ":3000"
	} else {
		port = os.Getenv("PORT")
	}

	log.Printf("Serving on '/' static files from %s on port %s\n", directoryPath, port)
	m.Handle(
		"/",
		http.StripPrefix(
			"/",
			http.FileServer(
				http.Dir(directoryPath), // e.g. "../vue-go/dist"  vue.js's html/css/js build directory
			),
		),
	)

	s := &http.Server{
		Addr:    port,
		Handler: m,
	}

	// Starting the server with the information input above
	log.Fatal(s.ListenAndServe())
}
