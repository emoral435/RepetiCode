package main

import (
	"fmt"
	"net/http"
)

func main() {
	fmt.Println("Hello, World!")
	http.Handle("/", http.FileServer(http.Dir("../frontend/dist/")))
	http.ListenAndServe(":3000", nil)
}
