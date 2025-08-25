package main

import (
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/yishak-cs/yaya-wallet/internal/config"
	"github.com/yishak-cs/yaya-wallet/internal/handler"
	"github.com/yishak-cs/yaya-wallet/internal/service"
)

func main() {

	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	yayaClient := config.LoadConfigFromEnv()

	if yayaClient.APIKey == "" || yayaClient.APISecret == "" {
		log.Fatal("YAYA_API_KEY and YAYA_API_SECRET environment variables are required")
	}

	server := &handler.Server{
		YayaClient:   &yayaClient,
		SelectedUser: make(map[string]service.User),
	}

	// Setup routes
	http.HandleFunc("/api/users", server.HandleSearch)
	http.HandleFunc("/api/select-user", server.HandleSelectUser)
	http.HandleFunc("/api/transactions", server.HandleTransactions)
	http.HandleFunc("/api/search", server.HandleSearch)

	// Add CORS middleware
	http.HandleFunc("/", server.CorsMiddleware)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
