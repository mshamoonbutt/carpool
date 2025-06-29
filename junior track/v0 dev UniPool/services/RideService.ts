import type { Ride, CreateRideData } from "@/types";
import { ApiRideService } from "./ApiRideService";
import { apiConfig, checkApiHealth } from "@/utils/apiConfig";
import { withFallback } from "@/utils/apiUtils";

export class RideService {
  private static STORAGE_KEY = "unipool_rides";

  // Check API availability on startup
  static {
    checkApiHealth().then((isOnline) => {
      console.log(
        `Ride Service: API is ${isOnline ? "online" : "offline"}. Using ${
          isOnline ? "backend API" : "localStorage"
        }.`
      );
    });
  }

  static async createRide(data: CreateRideData): Promise<Ride> {
    const isApiOnline = await checkApiHealth();

    if (isApiOnline) {
      try {
        console.log("Creating ride via API...");
        // Try to create ride via API
        const apiRideData: any = {
          origin: data.pickupArea,
          destination: data.destination,
          departure_time: data.departureTime,
          available_seats: data.totalSeats,
          price: 0, // Set a default price since our local model doesn't have price
          description: data.notes || data.route,
        };

        const apiRide = await ApiRideService.createRide(apiRideData);

        // Convert API ride to local format
        const ride: Ride = {
          id: apiRide.id.toString(),
          driverId: apiRide.driver_id.toString(),
          driverName: data.driverName, // Use local data as API might not return driver name
          pickupArea: apiRide.origin,
          destination: apiRide.destination,
          departureTime: apiRide.departure_time,
          totalSeats: apiRide.available_seats,
          availableSeats: apiRide.available_seats,
          route: data.route || "",
          notes: apiRide.description,
          status: "active",
          isRecurring: data.isRecurring || false,
          recurringDays: data.recurringDays,
          createdAt: apiRide.created_at,
        };

        console.log(`✅ Created ride via API with ID: ${ride.id}`);
        return ride;
      } catch (error) {
        console.warn(
          "API createRide failed, falling back to localStorage:",
          error
        );
        // Fall back to localStorage
      }
    }

    // If API is not available or failed, use localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const rides = this.getAllRides();

        if (data.isRecurring && data.recurringDays.length > 0) {
          // Create rides for the next 7 days
          const createdRides: Ride[] = [];
          const startDate = new Date(data.departureTime);

          for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);

            const dayName = currentDate.toLocaleDateString("en-US", {
              weekday: "long",
            });

            if (data.recurringDays.includes(dayName)) {
              const ride: Ride = {
                id: `${Date.now()}-${i}`,
                driverId: data.driverId,
                driverName: data.driverName,
                pickupArea: data.pickupArea,
                destination: data.destination,
                departureTime: currentDate.toISOString(),
                totalSeats: data.totalSeats,
                availableSeats: data.totalSeats,
                route: data.route,
                notes: data.notes,
                status: "active",
                isRecurring: true,
                recurringDays: data.recurringDays,
                createdAt: new Date().toISOString(),
              };

              rides.push(ride);
              createdRides.push(ride);
            }
          }

          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rides));
          console.log(
            `✅ Created ${createdRides.length} recurring rides in localStorage`
          );
          resolve(createdRides[0]); // Return first created ride
        } else {
          // Create single ride
          const ride: Ride = {
            id: Date.now().toString(),
            driverId: data.driverId,
            driverName: data.driverName,
            pickupArea: data.pickupArea,
            destination: data.destination,
            departureTime: data.departureTime,
            totalSeats: data.totalSeats,
            availableSeats: data.totalSeats,
            route: data.route,
            notes: data.notes,
            status: "active",
            isRecurring: false,
            createdAt: new Date().toISOString(),
          };

          rides.push(ride);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rides));
          console.log(`✅ Created ride in localStorage with ID: ${ride.id}`);
          resolve(ride);
        }
      }, 100);
    });
  }

  static async getRides(filters: any = {}): Promise<Ride[]> {
    const isApiOnline = await checkApiHealth();

    if (isApiOnline) {
      try {
        console.log("Fetching rides from API...");
        // Try to get rides from API
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
          driverName: apiRide.driver.name,
          pickupArea: apiRide.origin,
          destination: apiRide.destination,
          departureTime: apiRide.departure_time,
          totalSeats: apiRide.available_seats + (filters.bookedSeats || 0),
          availableSeats: apiRide.available_seats,
          route: apiRide.description,
          notes: apiRide.description,
          status:
            apiRide.status === "active"
              ? "active"
              : apiRide.status === "completed"
              ? "completed"
              : ("cancelled" as any),
          isRecurring: false, // API might not have this field
          createdAt: apiRide.created_at,
        }));

        console.log(`✅ Fetched ${rides.length} rides from API`);
        return rides;
      } catch (error) {
        console.warn(
          "API getRides failed, falling back to localStorage:",
          error
        );
        // Fall back to localStorage
      }
    }

    // If API is not available or failed, use localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        let rides = this.getAllRides();

        // Filter active rides only
        rides = rides.filter((ride) => ride.status === "active");

        // Filter by date if provided
        if (filters.date) {
          const filterDate = new Date(filters.date).toDateString();
          rides = rides.filter(
            (ride) => new Date(ride.departureTime).toDateString() === filterDate
          );
        }

        // Filter by pickup area if provided
        if (filters.pickupArea) {
          rides = rides.filter((ride) =>
            ride.pickupArea
              .toLowerCase()
              .includes(filters.pickupArea.toLowerCase())
          );
        }

        // Sort by departure time
        rides.sort(
          (a, b) =>
            new Date(a.departureTime).getTime() -
            new Date(b.departureTime).getTime()
        );

        console.log(`✅ Fetched ${rides.length} rides from localStorage`);
        resolve(rides);
      }, 100);
    });
  }

  static async searchRides(filters: any): Promise<Ride[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let rides = this.getAllRides();

        // Filter active rides with available seats
        rides = rides.filter(
          (ride) =>
            ride.status === "active" &&
            ride.availableSeats > 0 &&
            new Date(ride.departureTime) > new Date()
        );

        // Filter by pickup area
        if (filters.pickupArea) {
          rides = rides.filter((ride) =>
            ride.pickupArea
              .toLowerCase()
              .includes(filters.pickupArea.toLowerCase())
          );
        }

        // Filter by destination
        if (filters.destination) {
          rides = rides.filter(
            (ride) => ride.destination === filters.destination
          );
        }

        // Filter by date
        if (filters.date) {
          const filterDate = new Date(filters.date).toDateString();
          rides = rides.filter(
            (ride) => new Date(ride.departureTime).toDateString() === filterDate
          );
        }

        // Filter by time window
        if (filters.timeWindow && filters.time) {
          const targetTime = new Date(`${filters.date}T${filters.time}`);
          const windowMinutes = Number.parseInt(filters.timeWindow);

          rides = rides.filter((ride) => {
            const rideTime = new Date(ride.departureTime);
            const timeDiff =
              Math.abs(rideTime.getTime() - targetTime.getTime()) / (1000 * 60);
            return timeDiff <= windowMinutes;
          });
        }

        // Sort by rating (high to low), then by time proximity
        rides.sort((a, b) => {
          const aRating = a.driverRating || 0;
          const bRating = b.driverRating || 0;

          if (aRating !== bRating) {
            return bRating - aRating;
          }

          return (
            new Date(a.departureTime).getTime() -
            new Date(b.departureTime).getTime()
          );
        });

        resolve(rides);
      }, 100);
    });
  }

  static async getUserRides(userId: string): Promise<Ride[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rides = this.getAllRides();
        const userRides = rides.filter((ride) => ride.driverId === userId);
        userRides.sort(
          (a, b) =>
            new Date(b.departureTime).getTime() -
            new Date(a.departureTime).getTime()
        );
        resolve(userRides);
      }, 100);
    });
  }

  static async getAvailableRides(excludeUserId: string): Promise<Ride[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rides = this.getAllRides();
        const availableRides = rides.filter(
          (ride) =>
            ride.driverId !== excludeUserId &&
            ride.status === "active" &&
            ride.availableSeats > 0 &&
            new Date(ride.departureTime) > new Date()
        );

        // Sort by departure time
        availableRides.sort(
          (a, b) =>
            new Date(a.departureTime).getTime() -
            new Date(b.departureTime).getTime()
        );

        resolve(availableRides);
      }, 100);
    });
  }

  static async getRideById(rideId: string): Promise<Ride | null> {
    const isApiOnline = await checkApiHealth();

    if (isApiOnline) {
      try {
        console.log(`Fetching ride ${rideId} from API...`);
        // Try to get ride from API
        const apiRide = await ApiRideService.getRideById(parseInt(rideId));

        if (!apiRide) return null;

        // Convert API ride to local format
        const ride: Ride = {
          id: apiRide.id.toString(),
          driverId: apiRide.driver_id.toString(),
          driverName: apiRide.driver.name,
          pickupArea: apiRide.origin,
          destination: apiRide.destination,
          departureTime: apiRide.departure_time,
          totalSeats: apiRide.available_seats, // This is not accurate but will work for display
          availableSeats: apiRide.available_seats,
          route: apiRide.description,
          notes: apiRide.description,
          status:
            apiRide.status === "active"
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
        console.warn(
          `API getRideById failed for ${rideId}, falling back to localStorage:`,
          error
        );
        // Fall back to localStorage
      }
    }

    // If API is not available or failed, use localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const rides = this.getAllRides();
        const ride = rides.find((r) => r.id === rideId);
        console.log(
          `${
            ride ? "✅ Found" : "❌ Could not find"
          } ride ${rideId} in localStorage`
        );
        resolve(ride || null);
      }, 100);
    });
  }

  static async updateRide(
    rideId: string,
    updates: Partial<Ride>
  ): Promise<Ride | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rides = this.getAllRides();
        const index = rides.findIndex((r) => r.id === rideId);

        if (index !== -1) {
          rides[index] = { ...rides[index], ...updates };
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rides));
          resolve(rides[index]);
        } else {
          resolve(null);
        }
      }, 100);
    });
  }

  static async cancelRide(rideId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const rides = this.getAllRides();
        const index = rides.findIndex((r) => r.id === rideId);

        if (index !== -1) {
          rides[index].status = "cancelled";
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rides));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 100);
    });
  }

  private static getAllRides(): Ride[] {
    try {
      const ridesData = localStorage.getItem(this.STORAGE_KEY);
      return ridesData ? JSON.parse(ridesData) : [];
    } catch {
      return [];
    }
  }
}
