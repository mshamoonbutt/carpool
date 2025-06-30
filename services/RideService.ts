import type { Ride, CreateRideData } from "@/types";
import { ApiRideService } from "./ApiRideService";
import { apiConfig } from "@/utils/apiConfig";

export class RideService {
  // Check API availability on startup
  static {
    console.log("Initializing Ride Service - using backend API only");
  }

  static async createRide(data: CreateRideData): Promise<Ride> {
    try {
      console.log("Creating ride via API...");
      // Create ride via API
      const apiRideData: any = {
        origin: data.pickupArea,
        destination: data.destination,
        departure_time: data.departureTime,
        available_seats: data.totalSeats,
        price: 0, // Default price
        description: data.notes || data.route || "",
      };

      const apiRide = await ApiRideService.createRide(apiRideData);

      // Convert API ride to local format
      const ride: Ride = {
        id: apiRide.id.toString(),
        driverId: apiRide.driver_id.toString(),
        driverName: apiRide.driver?.name || data.driverName, // Prefer API data if available
        pickupArea: apiRide.origin,
        destination: apiRide.destination,
        departureTime: apiRide.departure_time,
        totalSeats: apiRide.available_seats,
        availableSeats: apiRide.available_seats,
        route: data.route || "",
        notes: apiRide.description,
        status:
          apiRide.status === "scheduled"
            ? "active"
            : apiRide.status === "completed"
            ? "completed"
            : ("cancelled" as "active" | "completed" | "cancelled"),
        isRecurring: data.isRecurring || false,
        recurringDays: data.recurringDays,
        createdAt: apiRide.created_at,
      };

      console.log(`✅ Created ride via API with ID: ${ride.id}`);
      return ride;
    } catch (error: any) {
      console.error(
        "API createRide failed:",
        error.response?.data?.detail || error.message,
        "Status:",
        error.response?.status
      );

      throw new Error(
        error.response?.data?.detail ||
          "Failed to create ride. Make sure you're logged in with a valid token and have driver permissions."
      );
    }
  }

  static async getRides(filters: any = {}): Promise<Ride[]> {
    try {
      console.log("Fetching rides from API...");
      // Get rides from API
      let apiRides;

      if (filters.pickupArea || filters.date) {
        // Use search endpoint if filters are provided
        apiRides = await ApiRideService.searchRides({
          origin: filters.pickupArea,
          min_date: filters.date,
          max_date: filters.date,
        });
      } else {
        // Otherwise get all rides
        apiRides = await ApiRideService.getAllRides();
      }

      // Convert API rides to local format
      const rides: Ride[] = apiRides.map((apiRide) => ({
        id: apiRide.id.toString(),
        driverId: apiRide.driver_id.toString(),
        driverName: apiRide.driver?.name || "Unknown",
        pickupArea: apiRide.origin,
        destination: apiRide.destination,
        departureTime: apiRide.departure_time,
        totalSeats: apiRide.available_seats + (filters.bookedSeats || 0),
        availableSeats: apiRide.available_seats,
        route: apiRide.description || "",
        notes: apiRide.description || "",
        status:
          apiRide.status === "scheduled"
            ? "active"
            : apiRide.status === "completed"
            ? "completed"
            : "cancelled",
        isRecurring: false, // API might not have this field
        createdAt: apiRide.created_at,
      }));

      console.log(`✅ Fetched ${rides.length} rides from API`);
      return rides;
    } catch (error) {
      console.error("Failed to fetch rides from API:", error);
      throw new Error("Failed to load rides. Please try again later.");
    }
  }

  static async searchRides(filters: any): Promise<Ride[]> {
    try {
      console.log("Searching rides from API...");
      // Use search endpoint with filters
      const apiRides = await ApiRideService.searchRides({
        origin: filters.pickupArea,
        destination: filters.destination,
        min_date: filters.date,
        max_date: filters.date,
        min_seats: 1, // Ensure at least one seat is available
      });

      // Convert API rides to local format
      const rides: Ride[] = apiRides.map((apiRide) => ({
        id: apiRide.id.toString(),
        driverId: apiRide.driver_id.toString(),
        driverName: apiRide.driver?.name || "Unknown",
        pickupArea: apiRide.origin,
        destination: apiRide.destination,
        departureTime: apiRide.departure_time,
        totalSeats: apiRide.available_seats + (filters.bookedSeats || 0),
        availableSeats: apiRide.available_seats,
        route: apiRide.description || "",
        notes: apiRide.description || "",
        status:
          apiRide.status === "scheduled"
            ? "active"
            : apiRide.status === "completed"
            ? "completed"
            : "cancelled",
        isRecurring: false,
        createdAt: apiRide.created_at,
      }));

      console.log(`✅ Found ${rides.length} matching rides from API`);
      return rides;
    } catch (error) {
      console.error("Failed to search rides from API:", error);
      throw new Error("Failed to search for rides. Please try again later.");
    }
  }

  static async getAvailableRides(excludeUserId: string): Promise<Ride[]> {
    try {
      console.log("Fetching available rides from API...");
      // Get all rides from API
      const apiRides = await ApiRideService.getAllRides();

      // Filter and convert API rides to local format
      const availableRides = apiRides
        .filter(
          (apiRide) =>
            apiRide.driver_id.toString() !== excludeUserId &&
            apiRide.status === "scheduled" &&
            apiRide.available_seats > 0 &&
            new Date(apiRide.departure_time) > new Date()
        )
        .map((apiRide) => ({
          id: apiRide.id.toString(),
          driverId: apiRide.driver_id.toString(),
          driverName: apiRide.driver?.name || "Unknown",
          pickupArea: apiRide.origin,
          destination: apiRide.destination,
          departureTime: apiRide.departure_time,
          totalSeats: apiRide.available_seats, // Assuming this is total available seats
          availableSeats: apiRide.available_seats,
          route: apiRide.description || "",
          notes: apiRide.description || "",
          status:
            apiRide.status === "scheduled"
              ? "active"
              : ((apiRide.status === "completed"
                  ? "completed"
                  : "cancelled") as "active" | "completed" | "cancelled"),
          isRecurring: false,
          createdAt: apiRide.created_at,
        }));

      // Sort by departure time
      availableRides.sort(
        (a, b) =>
          new Date(a.departureTime).getTime() -
          new Date(b.departureTime).getTime()
      );

      console.log(
        `✅ Fetched ${availableRides.length} available rides from API`
      );
      return availableRides;
    } catch (error) {
      console.error("Failed to fetch available rides from API:", error);
      throw new Error(
        "Failed to load available rides. Please try again later."
      );
    }
  }

  static async getRideById(rideId: string): Promise<Ride | null> {
    try {
      console.log(`Fetching ride ${rideId} from API...`);
      // Get ride from API
      const apiRide = await ApiRideService.getRideById(parseInt(rideId));

      if (!apiRide) return null;

      // Convert API ride to local format
      const ride: Ride = {
        id: apiRide.id.toString(),
        driverId: apiRide.driver_id.toString(),
        driverName: apiRide.driver?.name || "Unknown",
        pickupArea: apiRide.origin,
        destination: apiRide.destination,
        departureTime: apiRide.departure_time,
        totalSeats: apiRide.available_seats, // This is not accurate but will work for display
        availableSeats: apiRide.available_seats,
        route: apiRide.description || "",
        notes: apiRide.description || "",
        status:
          apiRide.status === "scheduled"
            ? "active"
            : apiRide.status === "completed"
            ? "completed"
            : ("cancelled" as any),
        isRecurring: false, // API might not have this field
        createdAt: apiRide.created_at,
      };

      console.log(`✅ Fetched ride ${rideId} from API`);
      return ride;
    } catch (error) {
      console.error(`Failed to fetch ride ${rideId} from API:`, error);
      throw new Error(`Failed to load ride ${rideId}. Please try again later.`);
    }
  }

  static async getUserRides(userId: string): Promise<Ride[]> {
    try {
      console.log(`Fetching user rides for user ${userId} from API...`);
      // Get all rides from API and filter by driver ID
      const apiRides = await ApiRideService.getAllRides();
      const userRides = apiRides.filter(
        (apiRide) => apiRide.driver_id.toString() === userId
      );

      // Convert API rides to local format
      const rides: Ride[] = userRides.map((apiRide) => ({
        id: apiRide.id.toString(),
        driverId: apiRide.driver_id.toString(),
        driverName: apiRide.driver?.name || "Unknown",
        pickupArea: apiRide.origin,
        destination: apiRide.destination,
        departureTime: apiRide.departure_time,
        totalSeats: apiRide.available_seats, // Assuming this is total available seats
        availableSeats: apiRide.available_seats,
        route: apiRide.description || "",
        notes: apiRide.description || "",
        status:
          apiRide.status === "scheduled"
            ? "active"
            : ((apiRide.status === "completed" ? "completed" : "cancelled") as
                | "active"
                | "completed"
                | "cancelled"),
        isRecurring: false, // API might not have this field
        createdAt: apiRide.created_at,
      }));

      // Sort by departure time (newest first)
      rides.sort(
        (a, b) =>
          new Date(b.departureTime).getTime() -
          new Date(a.departureTime).getTime()
      );

      console.log(
        `✅ Fetched ${rides.length} rides for user ${userId} from API`
      );
      return rides;
    } catch (error) {
      console.error(
        `Failed to fetch rides for user ${userId} from API:`,
        error
      );
      throw new Error(`Failed to load your rides. Please try again later.`);
    }
  }

  static async updateRide(
    rideId: string,
    data: Partial<CreateRideData>
  ): Promise<Ride | null> {
    try {
      console.log(`Updating ride ${rideId} via API...`);
      // Prepare API data
      const apiRideData: any = {};

      if (data.pickupArea) apiRideData.origin = data.pickupArea;
      if (data.destination) apiRideData.destination = data.destination;
      if (data.departureTime) apiRideData.departure_time = data.departureTime;
      if (data.totalSeats) apiRideData.available_seats = data.totalSeats;
      if (data.notes) apiRideData.description = data.notes;

      // Update ride via API
      const apiRide = await ApiRideService.updateRide(
        parseInt(rideId),
        apiRideData
      );

      if (!apiRide) return null;

      // Convert updated API ride to local format
      const ride: Ride = {
        id: apiRide.id.toString(),
        driverId: apiRide.driver_id.toString(),
        driverName: apiRide.driver?.name || "Unknown",
        pickupArea: apiRide.origin,
        destination: apiRide.destination,
        departureTime: apiRide.departure_time,
        totalSeats: apiRide.available_seats, // This is not accurate but will work for display
        availableSeats: apiRide.available_seats,
        route: data.route || "",
        notes: apiRide.description || "",
        status:
          apiRide.status === "scheduled"
            ? "active"
            : apiRide.status === "completed"
            ? "completed"
            : ("cancelled" as any),
        isRecurring: data.isRecurring || false,
        recurringDays: data.recurringDays,
        createdAt: apiRide.created_at,
      };

      console.log(`✅ Updated ride ${rideId} via API`);
      return ride;
    } catch (error: any) {
      console.error(`Failed to update ride ${rideId} via API:`, error);
      throw new Error(
        error.response?.data?.detail ||
          `Failed to update ride. Please try again later.`
      );
    }
  }

  static async cancelRide(rideId: string): Promise<void> {
    try {
      console.log(`Cancelling ride ${rideId} via API...`);
      // Cancel ride via API
      await ApiRideService.cancelRide(parseInt(rideId));
      console.log(`✅ Cancelled ride ${rideId} via API`);
    } catch (error: any) {
      console.error(`Failed to cancel ride ${rideId} via API:`, error);
      throw new Error(
        error.response?.data?.detail ||
          `Failed to cancel ride. Please try again later.`
      );
    }
  }
}
