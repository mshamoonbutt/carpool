// services/ApiRideService.ts

import axios from "axios";
import { ApiAuthService } from "./ApiAuthService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Ride {
  id: number;
  driver_id: number;
  origin: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  price: number;
  description: string;
  status: string;
  created_at: string;
  driver: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    is_active: boolean;
    created_at: string;
  };
}

export interface CreateRideData {
  origin: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  price: number;
  description?: string;
}

export interface SearchRideParams {
  origin?: string;
  destination?: string;
  min_date?: string;
  max_date?: string;
  max_price?: number;
  min_seats?: number;
}

export class ApiRideService {
  private static getAuthHeaders() {
    const token = ApiAuthService.getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  static async createRide(data: CreateRideData): Promise<Ride> {
    try {
      console.log("Creating ride with data:", data);

      // Ensure we have a valid token
      const token = ApiAuthService.getToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      // Add explicit Content-Type header
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      console.log("Using headers:", headers);
      console.log("Sending to API:", `${API_URL}/rides`);

      const response = await axios.post<Ride>(`${API_URL}/rides`, data, {
        headers,
      });

      console.log("API response success:", response.data);
      return response.data;
    } catch (error: any) {
      // Enhanced error logging
      console.error("Create ride API error:");

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        console.error("Headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error:", error.message);
      }
      console.error("Error config:", error.config);

      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      } else if (error.response?.status === 403) {
        throw new Error(
          "You don't have permission to create rides. Only drivers can create rides."
        );
      } else if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      } else {
        throw new Error(
          `Failed to create ride: ${error.message}. Check your network connection and try again.`
        );
      }
    }
  }

  static async getAllRides(): Promise<Ride[]> {
    try {
      const response = await axios.get<Ride[]>(`${API_URL}/rides`);
      return response.data;
    } catch (error: any) {
      console.error("Get rides error:", error.response?.data || error.message);
      return [];
    }
  }

  static async searchRides(params: SearchRideParams): Promise<Ride[]> {
    try {
      const response = await axios.get<Ride[]>(`${API_URL}/rides/search`, {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error(
        "Search rides error:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  static async getRideById(rideId: number): Promise<Ride | null> {
    try {
      const response = await axios.get<Ride>(`${API_URL}/rides/${rideId}`);
      return response.data;
    } catch (error: any) {
      console.error("Get ride error:", error.response?.data || error.message);
      return null;
    }
  }

  static async updateRide(
    rideId: number,
    data: Partial<CreateRideData>
  ): Promise<Ride | null> {
    try {
      const response = await axios.put<Ride>(
        `${API_URL}/rides/${rideId}`,
        data,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Update ride error:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.detail || "Failed to update ride");
    }
  }

  static async cancelRide(rideId: number): Promise<void> {
    try {
      await axios.put(
        `${API_URL}/rides/${rideId}`,
        { status: "cancelled" },
        this.getAuthHeaders()
      );
    } catch (error: any) {
      console.error(
        "Cancel ride error:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.detail || "Failed to cancel ride");
    }
  }
}
