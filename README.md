# YaYa Wallet Transaction Dashboard

A modern, secure transaction monitoring dashboard for YaYa Wallet that displays transaction history with visual indicators, search functionality, and pagination.

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture & Design Decisions](#-architecture--design-decisions)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
- [Development Setup](#-development-setup)
- [API Documentation](#-api-documentation)
- [Features](#-features)
- [Security Considerations](#-security-considerations)
- [Best Practices Implemented](#-best-practices-implemented)
- [Troubleshooting](#-troubleshooting)

## 🎯 Project Overview

This project builds a comprehensive transaction monitoring dashboard for YaYa Wallet that provides:

- **User Selection Interface**: Simple dropdown to select which user's transactions to view
- **Transaction Dashboard**: Tabular display with visual indicators for incoming/outgoing transactions
- **Search & Pagination**: Full-text search across transactions with paginated results
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Secure API Integration**: Proper HMAC-SHA256 signature authentication with YaYa Wallet API

## 🏗️ Architecture & Design Decisions

### Why Backend Proxy Architecture?

I chose a **backend proxy server** approach over direct frontend API calls for several critical reasons:

#### Security First
- **API Credentials Protection**: YaYa Wallet API keys and secrets never touch the client-side
- **Signature Generation**: Complex HMAC-SHA256 signature logic happens server-side
- **No Client Exposure**: Even environment variables in frontend builds expose credentials in JavaScript

#### Clean Separation of Concerns
```
Frontend (React) → Backend Proxy (Go) → YaYa Wallet API
     ↓                    ↓                    ↓
  UI Logic         Authentication        External API
  User State       Signature Generation   Transaction Data
  Routing          Session Management     Search Logic
```

#### Simplified User Experience
- **No Authentication Flow**: Users don't need to remember login credentials
- **Quick Evaluation**: Evaluators can immediately test functionality
- **User Context**: Easy switching between different user perspectives

### Why Go for Backend?

- **Performance**: low latency for API proxy
- **Security**: Strong standard library for cryptographic operations
- **Simplicity**: No framework overhead - pure `net/http` for focused functionality
- **Type Safety**: Compile-time error catching

### Why React with TypeScript?

- **Component Reusability**: Modular UI components for maintainable code
- **Type Safety**: Catch errors at development time, not runtime
- **Modern Ecosystem**: Excellent tooling with Vite, React Router, and Axios
- **Developer Experience**: Hot reload, excellent debugging, and IDE support

## 🛠️ Technology Stack

### Backend
- **Go 1.24.1** - Core backend language
- **net/http** - Standard HTTP server (no external frameworks)
- **godotenv** - Environment variable management
- **crypto/hmac** - HMAC-SHA256 signature generation

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first styling
- **pnpm** - Fast, disk-space efficient package manager

### DevOps
- **Air** - Go live reloading for development



## 🚀 Getting Started

### Prerequisites

- **Go 1.21+** - Backend development
- **Node.js 20+** - Frontend development  
- **pnpm** - Package manager for frontend
- **Git** - For cloning the repository

### Quick Start (5 minutes)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yishak-cs/yaya-wallet-dashboard.git
   cd yaya-wallet-dashboard
   ```

2. **Create Environment File**
  - User your own entries for the variables
   ```bash
   cp .env.example .env
   ```

3. **Setup Backend**
   ```bash
   # Install Go dependencies
   go mod download
   
   # Start the backend server
   go run main.go
   ```

4. **Setup Frontend** (in a new terminal)
   ```bash
   # Navigate to frontend directory
   cd frontend
   
   # Install dependencies
   pnpm install
   
   # Start the development server
   pnpm dev
   ```

5. **Access the Dashboard**
   - Backend API: http://localhost:8080
   - Frontend: http://localhost:3000
   - Select a user and start exploring transactions!

## 🔧 Development Setup

### Backend Development

1. **Install Dependencies**
   ```bash
   go mod download
   ```

2. **Install Air for Live Reloading** (optional)
   ```bash
   go install github.com/cosmtrek/air@latest
   ```

3. **Start Backend**
   ```bash
   # Regular start
   go run main.go
   
   # Or with live reload
   air
   ```

### Frontend Development

1. **Navigate to Frontend Directory**
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Start Development Server**
   ```bash
   pnpm dev
   ```

The frontend will be available at http://localhost:3000 and will proxy API requests to the backend at http://localhost:8080.

## 📡 API Documentation

### Backend Proxy Endpoints

#### `GET /api/users`
Returns list of available users for selection.

**Response:**
```json
[
  {"name": "Yaya Wallet Pii", "account": "yayawalletpi"},
  {"name": "YaYa PII SC", "account": "antenehgebey"},
  {"name": "Habetamu Worku Feleke", "account": "tewobstatewo"},
  {"name": "Surafel Araya", "account": "surafelaraya"}
]
```

#### `POST /api/select-user`
Selects a user for the current session.

**Request Body:**
```json
{"name": "Yaya Wallet Pii", "account": "yayawalletpi"}
```

**Response:**
```json
{
  "session_id": "session_1234567890",
  "message": "User selected successfully"
}
```

#### `GET /api/transactions?p={page}`
Fetches paginated transactions for selected user.

**Headers:** `X-Session-ID: session_1234567890`

**Response:**
```json
{
  "user": {"name": "...", "account": "..."},
  "transactions": {
    "data": [...],
    "pagination": {...}
  }
}
```

#### `POST /api/search`
Searches transactions by query string.

**Headers:** `X-Session-ID: session_1234567890`

**Request Body:**
```json
{"query": "search term"}
```

### YaYa Wallet API Integration

Our backend handles the complex authentication:

```go
// HMAC-SHA256 signature generation
func generateSignature(timestamp, method, endpoint, body, secret string) string {
    message := timestamp + method + endpoint + body
    h := hmac.New(sha256.New, []byte(secret))
    h.Write([]byte(message))
    return base64.StdEncoding.EncodeToString(h.Sum(nil))
}
```

**Key Implementation Details:**
- Query parameters excluded from signature calculation
- Unix timestamp for `YAYA-API-TIMESTAMP`
- Base64-encoded HMAC-SHA256 for `YAYA-API-SIGN`

## ✨ Features

### User Selection Page
- **Session Management**: Creates session for dashboard access
- **Validation**: Prevents access to dashboard without user selection

### Transaction Dashboard
- **Visual Indicators**: 
  - 🟢 for incoming transactions
  - 🔴 for outgoing transactions
- **Search Functionality**: Full-text search across sender, receiver, cause, and transaction ID
- **Pagination**: Navigate through large transaction sets
- **Responsive Design**: Mobile-friendly table layout
- **User Context**: Always displays current selected user with option to switch

### Technical Features
- **Type Safety**: Full TypeScript coverage with proper interfaces
- **Error Handling**: Comprehensive error states and user feedback
- **Session Persistence**: Maintains user selection across browser refreshes
- **Live Reload**: Development changes reflected immediately

## 🔒 Security Considerations

### API Credential Protection
- **Server-Side Only**: Credentials never exposed to client-side code
- **Environment Variables**: Secure credential storage
- **Signature Verification**: All YaYa Wallet requests properly signed

### Session Management
- **Temporary Sessions**: In-memory session storage (production would use Redis/database)
- **Session Validation**: All API calls validate session existence
- **Automatic Cleanup**: Sessions cleared on user switch

### CORS Configuration
- **Development Setup**: Permissive CORS for local development
- **Production Ready**: Easily configurable for specific origins

### Testing Strategy
- **API Testing**: Easy to test with curl/Postman
- **Component Testing**: React Testing Library compatible structure
- **Integration Testing**: Docker setup enables full-stack testing

## 🙏 Acknowledgments

- YaYa Wallet for providing the sandbox API
- And last but not least ....

---

**Made with ❤️ for secure, modern transaction monitoring**

```markdown
# Copy this README.md content to your repository
```