package config

import (
	"net/http"
	"os"

	"github.com/yishak-cs/yaya-wallet/internal/service"
)

func LoadConfigFromEnv() service.YaYaClient {
	return service.YaYaClient{
		BaseURL:   getEnvOrDefault("YA_YA_BASE_URL", "https://api.yayawallet.com/api/en"),
		APIKey:    getEnvOrDefault("YA_YA_API_KEY", ""),
		APISecret: getEnvOrDefault("YA_YA_API_SECRET", ""),
		Client:    &http.Client{},
	}
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
