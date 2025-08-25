#!/bin/bash

# YaYa Wallet API credentials
API_KEY="key-test_13817e87-33a9-4756-82e0-e6ac74be5f77"
API_SECRET="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcGlfa2V5Ijoia2V5LXRlc3RfMTM4MTdlODctMzNhOS00NzU2LTgyZTAtZTZhYzc0YmU1Zjc3Iiwic2VjcmV0IjoiY2E5ZjJhMGM5ZGI1ZmRjZWUxMTlhNjNiMzNkMzVlMWQ4YTVkNGZiYyJ9.HesEEFWkY55B8JhxSJT4VPJTXZ-4a18wWDRacTcimNw"

# API endpoint details
BASE_URL="https://sandbox.yayawallet.com"
ENDPOINT="/api/en/transaction/find-by-user"
METHOD="GET"

# Generate timestamp (Unix timestamp in seconds)
TIMESTAMP=$(date +%s)

# Request body (empty for GET request)
BODY=""

# Create the pre-hash string: {timestamp+method+endpoint+body}
PRE_HASH="${TIMESTAMP}${METHOD}${ENDPOINT}${BODY}"

echo "Pre-hash string: ${PRE_HASH}"

# Generate HMAC-SHA256 signature and base64 encode it
SIGNATURE=$(echo -n "$PRE_HASH" | openssl dgst -sha256 -hmac "$API_SECRET" -binary | base64)

echo "Generated signature: ${SIGNATURE}"

# Make the API call
echo -e "\nMaking API call..."
curl -X GET "${BASE_URL}${ENDPOINT}" \
  -H "YAYA-API-KEY: ${API_KEY}" \
  -H "YAYA-API-TIMESTAMP: ${TIMESTAMP}" \
  -H "YAYA-API-SIGN: ${SIGNATURE}" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n--- Testing Search Endpoint ---"

# Test the search endpoint with POST
SEARCH_ENDPOINT="/api/en/transaction/search"
SEARCH_METHOD="POST"
SEARCH_BODY='{"query": "test"}'

# Generate new timestamp for search request
SEARCH_TIMESTAMP=$(date +%s)

# Create the pre-hash string for search: {timestamp+method+endpoint+body}
SEARCH_PRE_HASH="${SEARCH_TIMESTAMP}${SEARCH_METHOD}${SEARCH_ENDPOINT}${SEARCH_BODY}"

echo "Search pre-hash string: ${SEARCH_PRE_HASH}"

# Generate HMAC-SHA256 signature for search
SEARCH_SIGNATURE=$(echo -n "$SEARCH_PRE_HASH" | openssl dgst -sha256 -hmac "$API_SECRET" -binary | base64)

echo "Search signature: ${SEARCH_SIGNATURE}"

# Make the search API call
echo -e "\nMaking search API call..."
curl -X POST "${BASE_URL}${SEARCH_ENDPOINT}" \
  -H "YAYA-API-KEY: ${API_KEY}" \
  -H "YAYA-API-TIMESTAMP: ${SEARCH_TIMESTAMP}" \
  -H "YAYA-API-SIGN: ${SEARCH_SIGNATURE}" \
  -H "Content-Type: application/json" \
  -d "$SEARCH_BODY" \
  -w "\nHTTP Status: %{http_code}\n"