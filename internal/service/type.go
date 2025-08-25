package service

import (
	"net/http"
	"time"
)

type User struct {
	Name    string
	Account string
}

type Transaction struct {
	ID                      string
	Sender                  User
	Receiver                User
	Amount_with_currency    string
	Amount                  float64
	Amount_in_base_currency float64
	Fee                     float64
	Currency                string
	Cause                   string
	Sender_caption          string
	Receiver_caption        string
	Created_at_time         int64
	Is_topup                bool
	Is_outgoing_transfer    bool
	Fee_vat                 float64
	Fee_before_vat          float64
	CreatedAt               time.Time
}

type YaYaClient struct {
	BaseURL   string
	APIKey    string
	APISecret string
	Client    *http.Client
}

type SearchRequest struct {
	Query string `json:"query"`
}
