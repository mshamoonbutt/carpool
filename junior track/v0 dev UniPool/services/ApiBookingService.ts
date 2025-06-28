// services/ApiBookingService.ts

import axios from "axios";
import { ApiAuthService } from "./ApiAuthService";
import { Ride } from "./ApiRideService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface Booking {
  id: number;
  ride_id: number;
  passenger_id: number;
  status: string;
  seats: number;
  created_at: string;
  passenger: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    is_active: boolean;
    created_at: string;
  };
  ride: Ride;
}

export interface CreateBookingData {
  ride_id: number;
  seats: number;
}

export class ApiBookingService {
  private static getAuthHeaders() {
    const token = ApiAuthService.getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  static async createBooking(data: CreateBookingData): Promise<Booking> {
    try {
      const response = await axios.post<Booking>(
        `${API_URL}/bookings`,
        data,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Create booking error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.detail || "Failed to create booking"
      );
    }
  }

  static async getMyBookings(): Promise<Booking[]> {
    try {
      const response = await axios.get<Booking[]>(
        `${API_URL}/bookings`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Get bookings error:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  static async getBookingsAsDriver(): Promise<Booking[]> {
    try {
      const response = await axios.get<Booking[]>(
        `${API_URL}/bookings/as-driver`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Get driver bookings error:",
        error.response?.data || error.message
      );
      return [];
    }
  }

  static async getBookingById(bookingId: number): Promise<Booking | null> {
    try {
      const response = await axios.get<Booking>(
        `${API_URL}/bookings/${bookingId}`,
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Get booking error:",
        error.response?.data || error.message
      );
      return null;
    }
  }

  static async updateBookingStatus(
    bookingId: number,
    status: string
  ): Promise<Booking | null> {
    try {
      const response = await axios.put<Booking>(
        `${API_URL}/bookings/${bookingId}`,
        { status },
        this.getAuthHeaders()
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "Update booking error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.detail || "Failed to update booking"
      );
    }
  }
}
