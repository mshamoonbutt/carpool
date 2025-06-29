import type { Booking, CreateBookingData } from "@/types";
import { RideService } from "./RideService";
import { ApiBookingService } from "./ApiBookingService";
import { apiConfig, checkApiHealth } from "@/utils/apiConfig";

export class BookingService {
  private static STORAGE_KEY = "unipool_bookings";

  // Check API availability on startup
  static {
    checkApiHealth().then((isOnline) => {
      console.log(
        `Booking Service: API is ${isOnline ? "online" : "offline"}. Using ${
          isOnline ? "backend API" : "localStorage"
        }.`
      );
    });
  }

  static async createBooking(data: CreateBookingData): Promise<Booking> {
    const isApiOnline = await checkApiHealth();

    if (isApiOnline) {
      try {
        console.log("Creating booking via API...");
        // Try to create booking via API
        const apiBookingData = {
          ride_id: parseInt(data.rideId),
          seats: 1, // Default to 1 seat as our local model doesn't specify seats
        };

        const apiBooking = await ApiBookingService.createBooking(
          apiBookingData
        );

        // Convert API booking to local format
        const booking: Booking = {
          id: apiBooking.id.toString(),
          rideId: apiBooking.ride_id.toString(),
          riderId: apiBooking.passenger_id.toString(),
          riderName: apiBooking.passenger.name,
          pickupPoint: data.pickupPoint || apiBooking.ride.origin,
          dropoffPoint: data.dropoffPoint || apiBooking.ride.destination,
          departureTime: apiBooking.ride.departure_time,
          driverName: apiBooking.ride.driver.name,
          status:
            apiBooking.status === "confirmed"
              ? "confirmed"
              : apiBooking.status === "cancelled"
              ? "cancelled"
              : apiBooking.status === "completed"
              ? "completed"
              : "pending",
          createdAt: apiBooking.created_at,
        };

        console.log(`✅ Created booking via API with ID: ${booking.id}`);
        return booking;
      } catch (error: any) {
        console.error(
          "API createBooking failed:",
          error.response?.data?.detail || error.message
        );

        // Fall back to localStorage only if specifically configured to do so
        if (process.env.NEXT_PUBLIC_ALLOW_FALLBACK === "true") {
          console.log("Using localStorage fallback for booking creation");
        } else {
          throw new Error(
            error.response?.data?.detail || "Failed to create booking"
          );
        }
      }
    }

    // If API is not available or failed, use localStorage
    return new Promise(async (resolve, reject) => {
      setTimeout(async () => {
        try {
          const bookings = this.getAllBookings();

          // Check if ride exists and has available seats
          const ride = await RideService.getRideById(data.rideId);
          if (!ride) {
            reject(new Error("Ride not found"));
            return;
          }

          if (ride.availableSeats <= 0) {
            reject(new Error("No seats available"));
            return;
          }

          // Check if user already booked this ride
          const existingBooking = bookings.find(
            (b) => b.rideId === data.rideId && b.riderId === data.riderId
          );

          if (existingBooking) {
            reject(new Error("You have already booked this ride"));
            return;
          }

          // Create booking
          const booking: Booking = {
            id: Date.now().toString(),
            rideId: data.rideId,
            riderId: data.riderId,
            riderName: data.riderName,
            pickupPoint: data.pickupPoint,
            dropoffPoint: data.dropoffPoint,
            departureTime: ride.departureTime,
            driverName: ride.driverName,
            status: "pending", // Set as pending by default
            createdAt: new Date().toISOString(),
          };

          bookings.push(booking);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));

          console.log(
            `✅ Created booking in localStorage with ID: ${booking.id}`
          );

          // Update ride available seats
          await RideService.updateRide(data.rideId, {
            availableSeats: ride.availableSeats - 1,
          });

          resolve(booking);
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  }

  static async getUserBookings(userId: string): Promise<Booking[]> {
    const isApiOnline = await checkApiHealth();

    if (isApiOnline) {
      try {
        console.log(`Fetching user bookings for user ${userId} from API...`);
        // Try to get user bookings from API
        // Note: The API only supports getting bookings for the current logged-in user
        const apiBookings = await ApiBookingService.getMyBookings();

        // Convert API bookings to local format
        const bookings: Booking[] = apiBookings.map((apiBooking: any) => ({
          id: apiBooking.id.toString(),
          rideId: apiBooking.ride_id.toString(),
          riderId: apiBooking.passenger_id.toString(),
          riderName: apiBooking.passenger.name,
          pickupPoint: apiBooking.ride.origin,
          dropoffPoint: apiBooking.ride.destination,
          departureTime: apiBooking.ride.departure_time,
          driverName: apiBooking.ride.driver.name,
          status:
            apiBooking.status === "confirmed"
              ? "confirmed"
              : apiBooking.status === "cancelled"
              ? "cancelled"
              : apiBooking.status === "completed"
              ? "completed"
              : "pending",
          createdAt: apiBooking.created_at,
        }));

        console.log(
          `✅ Fetched ${bookings.length} bookings for user ${userId} from API`
        );

        // Sort bookings by departure time (newest first)
        bookings.sort(
          (a, b) =>
            new Date(b.departureTime).getTime() -
            new Date(a.departureTime).getTime()
        );
        return bookings;
      } catch (error: any) {
        console.error(
          `API getUserBookings failed for ${userId}:`,
          error.response?.data?.detail || error.message
        );

        // Fall back to localStorage only if specifically configured to do so
        if (process.env.NEXT_PUBLIC_ALLOW_FALLBACK === "true") {
          console.log("Using localStorage fallback for getUserBookings");
        } else {
          return []; // Return empty array when API fails and fallback disabled
        }
      }
    }

    // If API is not available or failed, use localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const bookings = this.getAllBookings();
        const userBookings = bookings.filter(
          (booking) => booking.riderId === userId
        );
        userBookings.sort(
          (a, b) =>
            new Date(b.departureTime).getTime() -
            new Date(a.departureTime).getTime()
        );
        console.log(
          `✅ Fetched ${userBookings.length} bookings for user ${userId} from localStorage`
        );
        resolve(userBookings);
      }, 100);
    });
  }

  static async getRideBookings(rideId: string): Promise<Booking[]> {
    const isApiOnline = await checkApiHealth();

    if (isApiOnline) {
      try {
        console.log(`Fetching bookings for ride ${rideId} from API...`);
        // Try to get ride bookings from API using driver endpoint
        // This will get all bookings for all rides where the user is the driver
        const apiBookings = await ApiBookingService.getBookingsAsDriver();

        // Filter to get just the bookings for the specified ride
        const rideApiBookings = apiBookings.filter(
          (booking) => booking.ride_id.toString() === rideId
        );

        // Convert API bookings to local format
        const bookings: Booking[] = rideApiBookings.map((apiBooking: any) => ({
          id: apiBooking.id.toString(),
          rideId: apiBooking.ride_id.toString(),
          riderId: apiBooking.passenger_id.toString(),
          riderName: apiBooking.passenger.name,
          pickupPoint: apiBooking.ride.origin,
          dropoffPoint: apiBooking.ride.destination,
          departureTime: apiBooking.ride.departure_time,
          driverName: apiBooking.ride.driver.name,
          status:
            apiBooking.status === "confirmed"
              ? "confirmed"
              : apiBooking.status === "cancelled"
              ? "cancelled"
              : apiBooking.status === "completed"
              ? "completed"
              : "pending",
          createdAt: apiBooking.created_at,
        }));

        console.log(
          `✅ Fetched ${bookings.length} bookings for ride ${rideId} from API`
        );
        return bookings;
      } catch (error: any) {
        console.error(
          `API getRideBookings failed for ${rideId}:`,
          error.response?.data?.detail || error.message
        );

        // Fall back to localStorage only if specifically configured to do so
        if (process.env.NEXT_PUBLIC_ALLOW_FALLBACK === "true") {
          console.log("Using localStorage fallback for getRideBookings");
        } else {
          return []; // Return empty array when API fails and fallback disabled
        }
      }
    }

    // If API is not available or fallback is enabled, use localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const bookings = this.getAllBookings();
        const rideBookings = bookings.filter(
          (booking) => booking.rideId === rideId
        );
        resolve(rideBookings);
      }, 100);
    });
  }

  static async approveBooking(bookingId: string): Promise<boolean> {
    const isApiOnline = await checkApiHealth();

    if (isApiOnline) {
      try {
        console.log(`Approving booking with ID: ${bookingId} via API...`);
        // Try to approve booking via API
        const apiBooking = await ApiBookingService.updateBookingStatus(
          parseInt(bookingId),
          "confirmed"
        );
        console.log(`✅ Booking ${bookingId} approved via API`);
        return true;
      } catch (error: any) {
        console.error(
          `API approveBooking failed for ${bookingId}:`,
          error.response?.data?.detail || error.message
        );

        // Fall back to localStorage only if specifically configured to do so
        if (process.env.NEXT_PUBLIC_ALLOW_FALLBACK === "true") {
          console.log("Using localStorage fallback for approveBooking");
        } else {
          throw new Error(
            error.response?.data?.detail || "Failed to approve booking"
          );
        }
      }
    }

    // If API is not available or fallback is enabled, use localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        const bookings = this.getAllBookings();
        const index = bookings.findIndex((b) => b.id === bookingId);

        if (index !== -1) {
          // Update booking status to confirmed
          bookings[index].status = "confirmed";
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));
          console.log(`✅ Booking ${bookingId} approved in localStorage`);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 100);
    });
  }

  static async rejectBooking(bookingId: string): Promise<boolean> {
    const isApiOnline = await checkApiHealth();

    if (isApiOnline) {
      try {
        console.log(`Rejecting booking with ID: ${bookingId} via API...`);
        // Try to reject booking via API
        const apiBooking = await ApiBookingService.updateBookingStatus(
          parseInt(bookingId),
          "cancelled"
        );
        console.log(`✅ Booking ${bookingId} rejected via API`);
        return true;
      } catch (error: any) {
        console.error(
          `API rejectBooking failed for ${bookingId}:`,
          error.response?.data?.detail || error.message
        );

        // Fall back to localStorage only if specifically configured to do so
        if (process.env.NEXT_PUBLIC_ALLOW_FALLBACK === "true") {
          console.log("Using localStorage fallback for rejectBooking");
        } else {
          throw new Error(
            error.response?.data?.detail || "Failed to reject booking"
          );
        }
      }
    }

    // If API is not available or fallback is enabled, use localStorage
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const bookings = this.getAllBookings();
        const index = bookings.findIndex((b) => b.id === bookingId);

        if (index !== -1) {
          const booking = bookings[index];
          // Update booking status to rejected
          booking.status = "rejected";
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));

          // Update ride available seats (restore seats)
          const ride = await RideService.getRideById(booking.rideId);
          if (ride) {
            await RideService.updateRide(booking.rideId, {
              availableSeats: ride.availableSeats + 1, // Assuming 1 seat per booking
            });
          }

          console.log(`✅ Booking ${bookingId} rejected in localStorage`);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 100);
    });
  }

  static async cancelBooking(bookingId: string): Promise<boolean> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const bookings = this.getAllBookings();
        const index = bookings.findIndex((b) => b.id === bookingId);

        if (index !== -1) {
          const booking = bookings[index];

          // Check if cancellation is allowed (1 hour before departure)
          const departureTime = new Date(booking.departureTime);
          const now = new Date();
          const hoursDiff =
            (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

          if (hoursDiff < 1) {
            // Late cancellation - update status but don't remove
            bookings[index].status = "cancelled_late";
          } else {
            // Normal cancellation
            bookings[index].status = "cancelled";
          }

          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(bookings));

          // Update ride available seats
          const ride = await RideService.getRideById(booking.rideId);
          if (ride) {
            await RideService.updateRide(booking.rideId, {
              availableSeats: ride.availableSeats + 1,
            });
          }

          resolve(true);
        } else {
          resolve(false);
        }
      }, 100);
    });
  }

  private static getAllBookings(): Booking[] {
    try {
      const bookingsData = localStorage.getItem(this.STORAGE_KEY);
      return bookingsData ? JSON.parse(bookingsData) : [];
    } catch {
      return [];
    }
  }
}
