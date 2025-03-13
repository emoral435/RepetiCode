package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	fmt.Println("Hello, World! Starting new HTTP server... on port uhhh")

	m := http.NewServeMux()
	directoryPath := "./frontend/dist/"

	log.Printf("Serving on '/' static files from %s\n", directoryPath)
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
		Addr:    ":3000",
		Handler: m,
	}

	// Starting the server with the information input above
	log.Fatal(s.ListenAndServe())
}
