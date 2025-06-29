/**
 * Booking Routes
 * Handles all booking-related API endpoints
 */

const express = require('express');
const router = express.Router();
const BookingService = require('../services/BookingService');
const auth = require('../middleware/auth');
const validateBooking = require('../middleware/validation').validateBooking;

const bookingService = new BookingService();

/**
 * POST /api/bookings
 * Create a new booking
 */
router.post('/', auth, validateBooking, async (req, res) => {
  try {
    const bookingData = {
      ...req.body,
      riderId: req.user.id
    };

    const booking = await bookingService.bookRide(req.body.rideId, bookingData);
    
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/bookings/user
 * Get all bookings for the authenticated user
 */
router.get('/user', auth, async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0
    };

    const bookings = await bookingService.getUserBookings(req.user.id, filters);
    
    res.json({
      success: true,
      data: bookings,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: bookings.length
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/bookings/ride/:rideId
 * Get all bookings for a specific ride (driver only)
 */
router.get('/ride/:rideId', auth, async (req, res) => {
  try {
    const bookings = await bookingService.getRideBookings(req.params.rideId, req.user.id);
    
    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Get ride bookings error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/bookings/:id/cancel
 * Cancel a booking
 */
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const booking = await bookingService.cancelBooking(
      req.params.id, 
      reason || 'Cancelled by user', 
      req.user.id
    );
    
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/bookings/:id
 * Get a specific booking
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check if user has access to this booking
    if (booking.riderId !== req.user.id && booking.driverId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/bookings/availability/:rideId
 * Check seat availability for a ride
 */
router.get('/availability/:rideId', auth, async (req, res) => {
  try {
    const seatsRequested = parseInt(req.query.seats) || 1;
    
    const availability = await bookingService.checkSeatAvailability(
      req.params.rideId, 
      seatsRequested
    );
    
    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/bookings/stats
 * Get booking statistics for the user
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await bookingService.getUserBookingStats(req.user.id);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router; 