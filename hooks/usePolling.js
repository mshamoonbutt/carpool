// hooks/usePolling.js
// NEW FILE: Custom hook for implementing polling in components

import { useEffect, useCallback, useRef } from 'react';
import DataService from '@/services/DataService';

/**
 * Custom hook that provides real-time data updates via polling and storage events
 * @param {Function} fetchData - Function to fetch the latest data
 * @param {number} interval - Polling interval in milliseconds (default: 5000)
 * @param {boolean} enabled - Whether polling is enabled (default: true)
 */
export function usePolling(fetchData, interval = 5000, enabled = true) {
  const intervalRef = useRef(null);
  const fetchDataRef = useRef(fetchData);

  // Update ref when fetchData changes
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  // Stable callback that won't change on every render
  const stableFetchData = useCallback(() => {
    fetchDataRef.current();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Subscribe to DataService changes (cross-tab communication)
    const unsubscribe = DataService.subscribe(stableFetchData);

    // Set up polling interval
    intervalRef.current = setInterval(stableFetchData, interval);

    // Cleanup function
    return () => {
      unsubscribe();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [stableFetchData, interval, enabled]);

  // Manual refresh function
  const refresh = useCallback(() => {
    stableFetchData();
  }, [stableFetchData]);

  return { refresh };
}

/**
 * Hook specifically for ride data with user-specific filtering
 */
export function useRidePolling(currentUser, filters = {}) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRides = useCallback(async () => {
    try {
      const allRides = DataService.getRides(filters);
      setRides(allRides);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const { refresh } = usePolling(fetchRides, 5000, true);

  // Initial fetch
  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  return { rides, loading, refresh };
}

/**
 * Hook for user's own rides (driver view)
 */
export function useUserRides(userId) {
  const [userRides, setUserRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserRides = useCallback(async () => {
    if (!userId) {
      setUserRides([]);
      setLoading(false);
      return;
    }

    try {
      const rides = DataService.getUserRides(userId);
      setUserRides(rides);
    } catch (error) {
      console.error('Error fetching user rides:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const { refresh } = usePolling(fetchUserRides, 3000, !!userId);

  // Initial fetch
  useEffect(() => {
    fetchUserRides();
  }, [fetchUserRides]);

  return { userRides, loading, refresh };
}

/**
 * Hook for user's bookings (rider view)
 */
export function useUserBookings(userId) {
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserBookings = useCallback(async () => {
    if (!userId) {
      setUserBookings([]);
      setLoading(false);
      return;
    }

    try {
      const bookings = DataService.getUserBookings(userId);
      // Get ride details for each booking
      const bookingsWithRides = bookings.map(booking => {
        const ride = DataService.getRideById(booking.rideId);
        return { ...booking, ride };
      });
      setUserBookings(bookingsWithRides);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const { refresh } = usePolling(fetchUserBookings, 3000, !!userId);

  // Initial fetch
  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  return { userBookings, loading, refresh };
}

/**
 * Hook for notification counts (driver notifications)
 */
export function useNotifications(driverId) {
  const [notificationCount, setNotificationCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!driverId) {
      setNotificationCount(0);
      return;
    }

    try {
      const count = DataService.getPendingBookingsCount(driverId);
      setNotificationCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [driverId]);

  const { refresh } = usePolling(fetchNotifications, 3000, !!driverId);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notificationCount, refresh };
}