package config

import (
	"net/http"
	"os"

	"github.com/yishak-cs/yaya-wallet/internal/service"
)

func LoadConfigFromEnv() service.YaYaClient {
	return service.YaYaClient{
		BaseURL:   getEnvOrDefault("YAYA_BASE_URL", ""),
		APIKey:    getEnvOrDefault("YAYA_API_KEY", ""),
		APISecret: getEnvOrDefault("YAYA_API_SIGN", ""),
		Client:    &http.Client{},
	}
}

func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
