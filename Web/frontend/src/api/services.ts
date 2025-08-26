import type { User } from "@/types";

const API_BASE_URL = 'http://localhost:8080/api';

class ApiClient {
  private sessionId: string | null = null;

  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
    localStorage.setItem('yaya_session_id', sessionId);
  }

  getSessionId(): string | null {
    if (!this.sessionId) {
      this.sessionId = localStorage.getItem('yaya_session_id');
    }
    return this.sessionId;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    const sessionId = this.getSessionId();
    if (sessionId) {
      headers.set('X-Session-ID', sessionId);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getUsers(): Promise<User[]> {
    return this.makeRequest('/users');
  }

  async selectUser(user: User): Promise<{ session_id: string }> {
    const response = await this.makeRequest('/select-user', {
      method: 'POST',
      body: JSON.stringify(user),
    });
    this.setSessionId(response.session_id);
    return response;
  }

  async getTransactions(page: number = 1): Promise<any> {
    return this.makeRequest(`/transactions?p=${page}`);
  }

  async searchTransactions(query: string): Promise<any> {
    return this.makeRequest('/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }
}

export const apiClient = new ApiClient();