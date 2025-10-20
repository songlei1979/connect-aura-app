const API_BASE_URL = 'https://message-app-backend-t3-2025-v2.vercel.app/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ChatRoom {
  id: number;
  name: string;
  created_at?: string;
}

export interface Message {
  id: number;
  room_id: number;
  sender: string;
  content: string;
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  user?: {
    id: number;
    username: string;
  };
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    return headers;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/logout/`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getChatRooms(): Promise<ChatRoom[]> {
    const response = await fetch(`${API_BASE_URL}/chat_rooms/`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat rooms');
    }

    return response.json();
  }

  async createChatRoom(name: string): Promise<ChatRoom> {
    const response = await fetch(`${API_BASE_URL}/chat_rooms/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error('Failed to create chat room');
    }

    return response.json();
  }

  async updateChatRoom(id: number, name: string): Promise<ChatRoom> {
    const response = await fetch(`${API_BASE_URL}/chat_rooms/${id}/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error('Failed to update chat room');
    }

    return response.json();
  }

  async deleteChatRoom(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/chat_rooms/${id}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete chat room');
    }
  }

  async getChatRoomDetail(id: number): Promise<ChatRoom> {
    const response = await fetch(`${API_BASE_URL}/chat_rooms/${id}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat room detail');
    }

    return response.json();
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiClient = new ApiClient();
