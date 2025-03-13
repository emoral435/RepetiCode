package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	firebase "firebase.google.com/go"
)

func main() {
	fmt.Println("| Running Frontend on http://localhost:3000 |")

	// get our context for our app
	app, err := firebase.NewApp(context.Background(), nil)
	if err != nil {
		log.Fatalf("error initializing app: %v\n", err)
	}

	if err == nil {
		fmt.Println("%w", app)
	}

	http.Handle("/", http.FileServer(http.Dir("../frontend/dist/")))
	http.ListenAndServe(":3000", nil)
}
