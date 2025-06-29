/**
 * NotificationService - Real-time notifications for UniPool
 * Handles multi-channel notifications, WebSocket, email, SMS, and push notifications
 */

const { v4: uuidv4 } = require('uuid');
const NotificationRepository = require('../repositories/NotificationRepository');
const UserRepository = require('../repositories/UserRepository');

class NotificationService {
  constructor() {
    this.notificationRepo = new NotificationRepository();
    this.userRepo = new UserRepository();
    this.websocketClients = new Map(); // userId -> WebSocket connection
    
    // Notification channels configuration
    this.channels = {
      push: { enabled: true, priority: 'high' },
      email: { enabled: true, priority: 'medium' },
      sms: { enabled: false, priority: 'high' }, // Disabled for free service
      in_app: { enabled: true, priority: 'low' }
    };
  }

  /**
   * Send notification to a single user
   */
  async sendNotification(userId, notification) {
    try {
      // Validate notification data
      this.validateNotification(notification);

      // Get user preferences
      const user = await this.userRepo.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check quiet hours
      if (this.isInQuietHours(user.preferences?.quietHours)) {
        console.log(`Notification suppressed for user ${userId} due to quiet hours`);
        return null;
      }

      // Create notification record
      const notificationRecord = {
        id: uuidv4(),
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority || 'medium',
        data: notification.data || {},
        status: 'sent',
        createdAt: new Date(),
        expiresAt: notification.expiresAt || this.getDefaultExpiry()
      };

      // Save to database
      const savedNotification = await this.notificationRepo.create(notificationRecord);

      // Send through enabled channels
      const deliveryResults = await this.deliverNotification(user, savedNotification);

      // Update delivery status
      await this.updateDeliveryStatus(savedNotification.id, deliveryResults);

      return {
        ...savedNotification,
        deliveryResults
      };
    } catch (error) {
      console.error('NotificationService.sendNotification error:', error);
      throw error;
    }
  }

  /**
   * Send bulk notifications to multiple users
   */
  async sendBulkNotifications(userIds, notification) {
    try {
      const results = [];
      
      for (const userId of userIds) {
        try {
          const result = await this.sendNotification(userId, notification);
          results.push({ userId, success: true, result });
        } catch (error) {
          results.push({ userId, success: false, error: error.message });
        }
      }

      return {
        total: userIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      };
    } catch (error) {
      console.error('NotificationService.sendBulkNotifications error:', error);
      throw error;
    }
  }

  /**
   * Send ride-specific notifications
   */
  async notifyRideCreated(ride) {
    try {
      const driver = await this.userRepo.findById(ride.driverId);
      
      // Notify driver
      await this.sendNotification(ride.driverId, {
        type: 'ride_created',
        title: 'Ride Posted Successfully',
        message: `Your ride from ${ride.pickup} to ${ride.destination} has been posted.`,
        priority: 'medium',
        data: { rideId: ride.id }
      });

      // Find potential riders and send recommendations
      const potentialRiders = await this.findPotentialRiders(ride);
      
      if (potentialRiders.length > 0) {
        await this.sendBulkNotifications(
          potentialRiders.map(r => r.id),
          {
            type: 'ride_recommendation',
            title: 'New Ride Available',
            message: `A new ride is available from ${ride.pickup} to ${ride.destination} at ${new Date(ride.departureTime).toLocaleTimeString()}.`,
            priority: 'medium',
            data: { rideId: ride.id }
          }
        );
      }

      return { driverNotified: true, ridersNotified: potentialRiders.length };
    } catch (error) {
      console.error('NotificationService.notifyRideCreated error:', error);
      throw error;
    }
  }

  /**
   * Send booking confirmation notifications
   */
  async notifyBookingConfirmation(booking) {
    try {
      // Notify rider
      await this.sendNotification(booking.riderId, {
        type: 'booking_confirmed',
        title: 'Booking Confirmed',
        message: `Your booking for ride ${booking.bookingCode} has been confirmed.`,
        priority: 'high',
        data: { bookingId: booking.id, bookingCode: booking.bookingCode }
      });

      return { riderNotified: true };
    } catch (error) {
      console.error('NotificationService.notifyBookingConfirmation error:', error);
      throw error;
    }
  }

  /**
   * Send booking cancellation notifications
   */
  async notifyBookingCancellation(booking, cancellationResult) {
    try {
      // Notify rider
      await this.sendNotification(booking.riderId, {
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Your booking has been cancelled. Refund: ${cancellationResult.refundAmount}.`,
        priority: 'medium',
        data: { 
          bookingId: booking.id, 
          refundAmount: cancellationResult.refundAmount,
          reason: cancellationResult.reason
        }
      });

      // Notify driver
      const ride = await this.getRideForBooking(booking.rideId);
      await this.sendNotification(ride.driverId, {
        type: 'rider_cancelled',
        title: 'Rider Cancelled',
        message: `A rider has cancelled their booking. Seats are now available.`,
        priority: 'medium',
        data: { rideId: ride.id, seatsFreed: booking.seatsRequested }
      });

      return { riderNotified: true, driverNotified: true };
    } catch (error) {
      console.error('NotificationService.notifyBookingCancellation error:', error);
      throw error;
    }
  }

  /**
   * Send driver booking notification
   */
  async notifyDriverOfBooking(booking) {
    try {
      const ride = await this.getRideForBooking(booking.rideId);
      const rider = await this.userRepo.findById(booking.riderId);
      
      await this.sendNotification(ride.driverId, {
        type: 'new_booking',
        title: 'New Booking',
        message: `${rider.name} has booked ${booking.seatsRequested} seat(s) for your ride.`,
        priority: 'medium',
        data: { 
          bookingId: booking.id, 
          riderName: rider.name,
          seatsRequested: booking.seatsRequested
        }
      });

      return { driverNotified: true };
    } catch (error) {
      console.error('NotificationService.notifyDriverOfBooking error:', error);
      throw error;
    }
  }

  /**
   * Send ride reminder notifications
   */
  async sendRideReminders() {
    try {
      const upcomingRides = await this.getUpcomingRides();
      const results = [];

      for (const ride of upcomingRides) {
        // Send reminder to driver
        await this.sendNotification(ride.driverId, {
          type: 'ride_reminder',
          title: 'Ride Reminder',
          message: `Your ride to ${ride.destination} departs in 30 minutes.`,
          priority: 'high',
          data: { rideId: ride.id }
        });

        // Send reminders to booked riders
        const bookings = await this.getBookingsForRide(ride.id);
        for (const booking of bookings) {
          await this.sendNotification(booking.riderId, {
            type: 'ride_reminder',
            title: 'Ride Reminder',
            message: `Your ride from ${ride.pickup} departs in 30 minutes.`,
            priority: 'high',
            data: { rideId: ride.id, bookingId: booking.id }
          });
        }

        results.push({ rideId: ride.id, driverNotified: true, ridersNotified: bookings.length });
      }

      return results;
    } catch (error) {
      console.error('NotificationService.sendRideReminders error:', error);
      throw error;
    }
  }

  /**
   * Deliver notification through enabled channels
   */
  async deliverNotification(user, notification) {
    const results = {};

    // In-app notification (always enabled)
    if (this.channels.in_app.enabled) {
      results.in_app = await this.deliverInApp(user.id, notification);
    }

    // Push notification
    if (this.channels.push.enabled && user.preferences?.pushNotifications) {
      results.push = await this.deliverPush(user, notification);
    }

    // Email notification
    if (this.channels.email.enabled && user.preferences?.emailNotifications) {
      results.email = await this.deliverEmail(user, notification);
    }

    // SMS notification (disabled for free service)
    if (this.channels.sms.enabled && user.preferences?.smsNotifications) {
      results.sms = await this.deliverSMS(user, notification);
    }

    return results;
  }

  /**
   * Deliver in-app notification via WebSocket
   */
  async deliverInApp(userId, notification) {
    try {
      const ws = this.websocketClients.get(userId);
      if (ws && ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify({
          type: 'notification',
          payload: notification
        }));
        return { status: 'delivered', timestamp: new Date() };
      }
      return { status: 'offline', timestamp: new Date() };
    } catch (error) {
      return { status: 'failed', error: error.message, timestamp: new Date() };
    }
  }

  /**
   * Deliver push notification
   */
  async deliverPush(user, notification) {
    try {
      // This would integrate with a push notification service
      // For now, simulate successful delivery
      console.log(`Push notification sent to ${user.name}: ${notification.title}`);
      return { status: 'delivered', timestamp: new Date() };
    } catch (error) {
      return { status: 'failed', error: error.message, timestamp: new Date() };
    }
  }

  /**
   * Deliver email notification
   */
  async deliverEmail(user, notification) {
    try {
      // This would integrate with an email service
      // For now, simulate successful delivery
      console.log(`Email sent to ${user.email}: ${notification.title}`);
      return { status: 'delivered', timestamp: new Date() };
    } catch (error) {
      return { status: 'failed', error: error.message, timestamp: new Date() };
    }
  }

  /**
   * Deliver SMS notification
   */
  async deliverSMS(user, notification) {
    try {
      // This would integrate with an SMS service
      // For now, simulate successful delivery
      console.log(`SMS sent to ${user.phone}: ${notification.title}`);
      return { status: 'delivered', timestamp: new Date() };
    } catch (error) {
      return { status: 'failed', error: error.message, timestamp: new Date() };
    }
  }

  /**
   * Register WebSocket client
   */
  registerWebSocketClient(userId, ws) {
    this.websocketClients.set(userId, ws);
    console.log(`WebSocket client registered for user ${userId}`);
  }

  /**
   * Unregister WebSocket client
   */
  unregisterWebSocketClient(userId) {
    this.websocketClients.delete(userId);
    console.log(`WebSocket client unregistered for user ${userId}`);
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, filters = {}) {
    try {
      const notifications = await this.notificationRepo.findByUserId(userId, filters);
      return notifications;
    } catch (error) {
      console.error('NotificationService.getUserNotifications error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      await this.notificationRepo.update(notificationId, {
        status: 'read',
        readAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('NotificationService.markAsRead error:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    try {
      const count = await this.notificationRepo.getUnreadCount(userId);
      return count;
    } catch (error) {
      console.error('NotificationService.getUnreadCount error:', error);
      throw error;
    }
  }

  /**
   * Check if user is in quiet hours
   */
  isInQuietHours(quietHours) {
    if (!quietHours) return false;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Get default expiry time
   */
  getDefaultExpiry() {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7); // 7 days from now
    return expiry;
  }

  /**
   * Validate notification data
   */
  validateNotification(notification) {
    if (!notification.type) {
      throw new Error('Notification type is required');
    }
    if (!notification.title) {
      throw new Error('Notification title is required');
    }
    if (!notification.message) {
      throw new Error('Notification message is required');
    }
    if (notification.title.length > 100) {
      throw new Error('Notification title too long');
    }
    if (notification.message.length > 500) {
      throw new Error('Notification message too long');
    }
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(notificationId, deliveryResults) {
    const hasFailures = Object.values(deliveryResults).some(result => result.status === 'failed');
    const status = hasFailures ? 'partial' : 'delivered';
    
    await this.notificationRepo.update(notificationId, {
      status,
      deliveryResults
    });
  }

  /**
   * Find potential riders for a ride
   */
  async findPotentialRiders(ride) {
    // This would query users who frequently travel to the same destination
    // For now, return empty array
    return [];
  }

  /**
   * Get ride for booking
   */
  async getRideForBooking(rideId) {
    // This would come from RideRepository
    // For now, return mock data
    return { id: rideId, driverId: 'mock-driver-id' };
  }

  /**
   * Get upcoming rides
   */
  async getUpcomingRides() {
    // This would come from RideRepository
    // For now, return empty array
    return [];
  }

  /**
   * Get bookings for ride
   */
  async getBookingsForRide(rideId) {
    // This would come from BookingRepository
    // For now, return empty array
    return [];
  }
}

module.exports = NotificationService; 