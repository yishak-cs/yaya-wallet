# Use a Node.js base image for building the React app
FROM node:alpine AS frontend-builder

# Install pnpm
RUN npm install -g pnpm

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml to install dependencies
COPY Web/frontend/package.json Web/frontend/pnpm-lock.yaml ./Web/frontend/

# Install project dependencies (including dev dependencies for build)
WORKDIR /app/Web/frontend
RUN echo "=== Installing dependencies ===" && \
    pnpm install --include=dev && \
    echo "=== Checking if TypeScript is installed ===" && \
    ls -la node_modules/.bin/tsc* || echo "TypeScript not found in .bin" && \
    echo "=== Checking if Vite is installed ===" && \
    ls -la node_modules/.bin/vite* || echo "Vite not found in .bin" && \
    echo "=== Node modules structure ===" && \
    ls -la node_modules/ | head -10

# Copy the entire React application code
COPY Web/frontend/ ./

# Build the React application for production
RUN echo "=== Starting build ===" && \
    pnpm run build && \
    echo "=== Build completed ==="

# Stage 2: Build the Go backend
FROM golang:1.24.1-alpine AS backend-builder

# Set working directory
WORKDIR /app

# Copy Go mod files
COPY go.mod go.sum ./

# Download Go dependencies
RUN go mod download

# Copy source code
COPY . .

# Copy built frontend from previous stage  
COPY --from=frontend-builder /app/Web/frontend/dist ./Web/static

# Build the Go application with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build -tags netgo -ldflags '-s -w' -o app ./cmd/server

# Stage 3: Final runtime image
FROM alpine:latest

# Install ca-certificates for HTTPS and curl for health checks
RUN apk --no-cache add ca-certificates curl tzdata

# Create app directory
WORKDIR /root/

# Copy the binary and frontend files
COPY --from=backend-builder /app/app .
COPY --from=backend-builder /app/Web/static ./Web/static

# Expose port
EXPOSE 8080

# Set environment variables
ENV APP_PORT=8080

# Run the application
CMD ["./app"]