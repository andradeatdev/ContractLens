package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/app"
)


func main() {
	handler := app.NewApp()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on :%s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
