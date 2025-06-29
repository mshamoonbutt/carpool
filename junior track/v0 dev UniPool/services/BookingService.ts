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
              : ("pending" as any),
          createdAt: apiBooking.created_at,
        };

        console.log(`✅ Created booking via API with ID: ${booking.id}`);
        return booking;
      } catch (error) {
        console.warn(
          "API createBooking failed, falling back to localStorage:",
          error
        );
        // Fall back to localStorage
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
            status: "confirmed",
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
              : ("pending" as any),
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
      } catch (error) {
        console.warn(
          `API getUserBookings failed for ${userId}, falling back to localStorage:`,
          error
        );
        // Fall back to localStorage
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
