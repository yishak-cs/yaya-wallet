package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/yishak-cs/yaya-wallet/internal/service"
)

type Server struct {
	YayaClient   *service.YaYaClient
	SelectedUser map[string]service.User
}

func NewServer(yayaClient *service.YaYaClient) *Server {
	return &Server{
		YayaClient:   yayaClient,
		SelectedUser: make(map[string]service.User),
	}
}

// corsWrapper wraps handlers with CORS headers
func (s *Server) CorsWrapper(handler func(http.ResponseWriter, *http.Request)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Session-ID")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		handler(w, r)
	}
}

func (s *Server) HandleUsers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	users := []service.User{
		{Name: "Yaya Wallet Pii", Account: "yayawalletpi"},
		{Name: "YaYa PII SC", Account: "antenehgebey"},
		{Name: "Habetamu Worku Feleke", Account: "tewobstatewo"},
		{Name: "Surafel Araya", Account: "surafelaraya"},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func (s *Server) HandleSelectUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var user service.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	sessionID := r.Header.Get("X-Session-ID")
	if sessionID == "" {
		sessionID = fmt.Sprintf("session_%d", time.Now().UnixNano())
	}

	s.SelectedUser[sessionID] = user

	response := map[string]string{
		"session_id": sessionID,
		"message":    "User selected successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) HandleTransactions(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	sessionID := r.Header.Get("X-Session-ID")
	if sessionID == "" {
		http.Error(w, "Session ID required", http.StatusBadRequest)
		return
	}

	user, exists := s.SelectedUser[sessionID]
	if !exists {
		http.Error(w, "No user selected for session", http.StatusBadRequest)
		return
	}

	page := r.URL.Query().Get("p")
	if page == "" {
		page = "20"
	}

	// Make request to YaYa Wallet API
	endpoint := "/api/en/transaction/find-by-user?p=" + page
	resp, err := s.YayaClient.MakeRequest("GET", endpoint, nil)
	if err != nil {
		log.Printf("Error fetching transactions: %v", err)
		http.Error(w, "Error fetching transactions", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response: %v", err)
		http.Error(w, "Error reading response", http.StatusInternalServerError)
		return
	}

	var apiResponse map[string]interface{}
	if err := json.Unmarshal(body, &apiResponse); err != nil {
		log.Printf("Error parsing response: %v", err)
		http.Error(w, "Error parsing response", http.StatusInternalServerError)
		return
	}

	// Add user context and transaction indicators
	response := map[string]interface{}{
		"user":         user,
		"transactions": apiResponse,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// handleSearch performs transaction search
func (s *Server) HandleSearch(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	sessionID := r.Header.Get("X-Session-ID")
	if sessionID == "" {
		http.Error(w, "Session ID required", http.StatusBadRequest)
		return
	}

	user, exists := s.SelectedUser[sessionID]
	if !exists {
		http.Error(w, "No user selected for session", http.StatusBadRequest)
		return
	}

	var searchReq service.SearchRequest
	if err := json.NewDecoder(r.Body).Decode(&searchReq); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	requestBody, err := json.Marshal(searchReq)
	if err != nil {
		http.Error(w, "Error preparing search request", http.StatusInternalServerError)
		return
	}

	// Make request to YaYa Wallet API
	resp, err := s.YayaClient.MakeRequest("POST", "/api/en/transaction/search", requestBody)
	if err != nil {
		log.Printf("Error searching transactions: %v", err)
		http.Error(w, "Error searching transactions", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading search response: %v", err)
		http.Error(w, "Error reading response", http.StatusInternalServerError)
		return
	}

	// Parse and return response with user context
	var apiResponse map[string]interface{}
	if err := json.Unmarshal(body, &apiResponse); err != nil {
		log.Printf("Error parsing search response: %v", err)
		http.Error(w, "Error parsing response", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"user":    user,
		"results": apiResponse,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
