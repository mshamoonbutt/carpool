// services/ApiAuthService.ts

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  role: "driver" | "rider" | "both";
  password: string;
}

export class ApiAuthService {
  private static TOKEN_KEY = "unipool_token";
  private static USER_KEY = "unipool_user";

  static async login(data: LoginData): Promise<User> {
    try {
      // Format data for FastAPI OAuth2 flow
      const formData = new FormData();
      formData.append("username", data.email); // FastAPI uses 'username' for email
      formData.append("password", data.password);

      const response = await axios.post<AuthResponse>(
        `${API_URL}/users/login`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Store token in localStorage
      localStorage.setItem(this.TOKEN_KEY, response.data.access_token);

      // Get user info
      const user = await this.getCurrentUser();
      return user;
    } catch (error: any) {
      console.error("Login error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.detail || "Invalid email or password"
      );
    }
  }

  static async register(data: RegisterData): Promise<User> {
    try {
      const response = await axios.post<User>(
        `${API_URL}/users/register`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.detail || "Registration failed");
    }
  }

  static async getCurrentUser(): Promise<User> {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);

      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await axios.get<User>(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Store user data
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.data));

      return response.data;
    } catch (error: any) {
      console.error(
        "Get current user error:",
        error.response?.data || error.message
      );
      this.logout(); // Clear invalid session
      throw new Error(
        error.response?.data?.detail || "Failed to get user info"
      );
    }
  }

  static async logout(): Promise<void> {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getUserFromStorage(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
