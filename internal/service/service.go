package service

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"net/http"
	"strconv"
	"time"
)

func (c *YaYaClient) generateSignature(timestamp, method, endpoint, body string) string {
	message := timestamp + method + endpoint + body
	h := hmac.New(sha256.New, []byte(c.APISecret))
	h.Write([]byte(message))
	return base64.StdEncoding.EncodeToString(h.Sum(nil))
}

// makeRequest makes an authenticated request to YaYa Wallet API
func (c *YaYaClient) MakeRequest(method, endpoint string, body []byte, queryParams string) (*http.Response, error) {

	url := c.BaseURL + endpoint
	if queryParams != "" {
		url += "?" + queryParams
	}

	timestamp := strconv.FormatInt(time.Now().Unix(), 10)

	var bodyStr string
	if body != nil {
		bodyStr = string(body)
	}

	signature := c.generateSignature(timestamp, method, endpoint, bodyStr)

	var req *http.Request
	var err error

	if body != nil {
		req, err = http.NewRequest(method, url, bytes.NewBuffer(body))
	} else {
		req, err = http.NewRequest(method, url, nil)
	}

	if err != nil {
		return nil, err
	}

	req.Header.Set("YAYA-API-KEY", c.APIKey)
	req.Header.Set("YAYA-API-TIMESTAMP", timestamp)
	req.Header.Set("YAYA-API-SIGN", signature)
	req.Header.Set("Content-Type", "application/json")

	return c.Client.Do(req)
}
