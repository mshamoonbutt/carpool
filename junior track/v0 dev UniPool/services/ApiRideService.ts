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
      const response = await axios.post<Ride>(
        `${API_URL}/rides`,
        data,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Create ride error:",
        error.response?.data || error.message
      );
      throw new Error(error.response?.data?.detail || "Failed to create ride");
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
