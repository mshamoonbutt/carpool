import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MapboxMap from '../components/map/MapboxMap';
import DataService from '../services/DataService';
import AuthService from '../services/AuthService';
import { lahoreLocations, searchLocations, getNearbyLocations } from '../data/locations.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const mapContainerRef = useRef(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [route, setRoute] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [estimatedDistance, setEstimatedDistance] = useState(null);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  
  // GPS and tracking states
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [trackingInterval, setTrackingInterval] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [isRideActive, setIsRideActive] = useState(false);
  const [rideStatus, setRideStatus] = useState('idle'); // idle, searching, matched, in-progress, completed
  const [locationUpdateCount, setLocationUpdateCount] = useState(0);

  // Carpooling states
  const [activeTab, setActiveTab] = useState('find'); // 'find', 'post', 'requests'
  const [availableRides, setAvailableRides] = useState([]);
  const [myPostedRides, setMyPostedRides] = useState([]);
  const [rideRequests, setRideRequests] = useState([]);
  const [isPostingRide, setIsPostingRide] = useState(false);
  const [ridePrice, setRidePrice] = useState('');
  const [rideDate, setRideDate] = useState('');
  const [rideTime, setRideTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState(3);
  const [rideDescription, setRideDescription] = useState('');
  const [newRidesCount, setNewRidesCount] = useState(0);
  const [isSearchingLocations, setIsSearchingLocations] = useState(false);

  // Using centralized location data from src/data/locations.js
  const predefinedLocations = lahoreLocations;

  useEffect(() => {
    // Get current user from AuthService
    const currentUser = AuthService.getCurrentUser();
    console.log('🔍 Dashboard: Getting current user...');
    console.log('Dashboard: Current user:', currentUser);
    
    if (currentUser) {
      console.log('✅ Dashboard: User loaded:', currentUser.name);
      setUser(currentUser);
    }

    // Request notification permission for ride updates
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Debug container dimensions
    if (mapContainerRef.current) {
      console.log('Dashboard: Map container dimensions:', {
        width: mapContainerRef.current.offsetWidth,
        height: mapContainerRef.current.offsetHeight,
        clientHeight: mapContainerRef.current.clientHeight,
        scrollHeight: mapContainerRef.current.scrollHeight
      });
    }
  }, [user]);

  // GPS Location Functions
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString()
        };
        
        setCurrentLocation(newLocation);
        setLocationUpdateCount(prev => prev + 1);
        console.log(`GPS Update #${locationUpdateCount + 1}:`, newLocation);
        
        // Update location permission status
        setLocationPermission('granted');
      },
      (error) => {
        console.error('GPS Error:', error);
        setLocationPermission('denied');
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location permission denied. Please enable location access.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('Location information unavailable.');
            break;
          case error.TIMEOUT:
            alert('Location request timed out.');
            break;
          default:
            alert('An unknown error occurred getting location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsTracking(true);
    console.log('Starting location tracking...');

    // Get initial location
    getCurrentLocation();

    // Set up continuous tracking
    const interval = setInterval(() => {
      getCurrentLocation();
    }, 3000); // Update every 3 seconds

    setTrackingInterval(interval);
  };

  const stopLocationTracking = () => {
    setIsTracking(false);
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
    console.log('Location tracking stopped.');
  };

  // Simulate driver location updates (for demo purposes)
  const simulateDriverTracking = () => {
    if (!route || !currentLocation) return;

    const driverInterval = setInterval(() => {
      // Simulate driver moving along the route
      const progress = Math.random() * 0.8; // Random progress along route
      const routeCoords = route.coordinates;
      const index = Math.floor(progress * (routeCoords.length - 1));
      
      if (routeCoords[index]) {
        setDriverLocation({
          lat: routeCoords[index][1],
          lng: routeCoords[index][0]
        });
      }
    }, 3000); // Update every 3 seconds

    return driverInterval;
  };

  const startRide = () => {
    if (!currentLocation) {
      alert('Please enable location tracking first.');
      return;
    }

    setIsRideActive(true);
    setRideStatus('searching');
    
    // Simulate ride matching
    setTimeout(() => {
      setRideStatus('matched');
      const driverInterval = simulateDriverTracking();
      
      // Start actual ride after 2 seconds
      setTimeout(() => {
        setRideStatus('in-progress');
      }, 2000);
    }, 3000);
  };

  const useCurrentLocation = () => {
    if (!currentLocation) {
      alert('Please enable GPS first to use current location.');
      return;
    }
    
    const gpsText = `GPS: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`;
    setOrigin(gpsText);
    console.log('Set origin to current location:', gpsText);
  };

  // Carpooling Functions
  const postRide = async () => {
    if (!origin || !destination) {
      alert('Please enter both origin and destination.');
      return;
    }

    setIsPostingRide(true);

    try {
      let originCoords, destCoords;

      // Get coordinates for origin and destination
      if (origin.startsWith('GPS:')) {
        const coordsMatch = origin.match(/GPS: ([\d.-]+), ([\d.-]+)/);
        if (coordsMatch) {
          // GPS format is "GPS: lat, lng" but we need [lng, lat] for Mapbox
          const lat = parseFloat(coordsMatch[1]);
          const lng = parseFloat(coordsMatch[2]);
          originCoords = [lng, lat]; // Mapbox expects [longitude, latitude]
          console.log('Using GPS origin coordinates:', originCoords, 'from GPS string:', origin);
        } else {
          alert('Invalid GPS coordinates format.');
          setIsPostingRide(false);
          return;
        }
      } else {
        const originPredefined = Object.entries(predefinedLocations).find(([key, location]) => 
          key.toLowerCase() === origin.toLowerCase() || 
          location.name.toLowerCase() === origin.toLowerCase()
        );
        originCoords = originPredefined ? originPredefined[1].coordinates : null;
      }

      const destPredefined = Object.entries(predefinedLocations).find(([key, location]) => 
        key.toLowerCase() === destination.toLowerCase() || 
        location.name.toLowerCase() === destination.toLowerCase()
      );
      destCoords = destPredefined ? destPredefined[1].coordinates : null;

      if (!originCoords || !destCoords) {
        alert('Could not determine coordinates for origin or destination.');
        setIsPostingRide(false);
        return;
      }

      const newRide = {
        id: `ride_${Date.now()}`,
        driver: user,
        origin: origin.startsWith('GPS:') ? 'Current Location' : origin,
        destination: destination,
        originCoords: originCoords,
        destCoords: destCoords,
        price: 0, // Free rides for students
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        availableSeats: availableSeats,
        description: rideDescription || 'Student carpool ride',
        status: 'active',
        createdAt: new Date().toISOString(),
        requests: []
      };

      // Save to DataService (in real app, this would go to database)
      DataService.addRide(newRide);

      // Update local state
      setMyPostedRides(prev => [...prev, newRide]);
      
      // Reset form
      setOrigin('');
      setDestination('');
      setRidePrice('');
      setRideDate('');
      setRideTime('');
      setAvailableSeats(3);
      setRideDescription('');
      
      alert('Ride posted successfully! Other students can now find your ride.');
    } catch (error) {
      console.error('Error posting ride:', error);
      alert('Error posting ride. Please try again.');
    } finally {
      setIsPostingRide(false);
    }
  };

  const findAvailableRides = async () => {
    if (!origin || !destination) {
      alert('Please enter both origin and destination.');
      return;
    }

    setIsSearching(true);

    try {
      let originCoords, destCoords;

      // Get coordinates for search
      if (origin.startsWith('GPS:')) {
        const coordsMatch = origin.match(/GPS: ([\d.-]+), ([\d.-]+)/);
        if (coordsMatch) {
          const lat = parseFloat(coordsMatch[1]);
          const lng = parseFloat(coordsMatch[2]);
          originCoords = [lng, lat]; // Mapbox expects [longitude, latitude]
        }
      } else {
        const originPredefined = Object.entries(predefinedLocations).find(([key, location]) => 
          key.toLowerCase() === origin.toLowerCase() || 
          location.name.toLowerCase() === origin.toLowerCase()
        );
        originCoords = originPredefined ? originPredefined[1].coordinates : null;
      }

      const destPredefined = Object.entries(predefinedLocations).find(([key, location]) => 
        key.toLowerCase() === destination.toLowerCase() || 
        location.name.toLowerCase() === destination.toLowerCase()
      );
      destCoords = destPredefined ? destPredefined[1].coordinates : null;

      if (!originCoords || !destCoords) {
        alert('Could not determine coordinates for origin or destination.');
        setIsSearching(false);
        return;
      }

      // Get all rides from DataService
      const allRides = DataService.getRides();
      
      // Filter rides that match origin and destination (with some tolerance)
      const matchingRides = allRides.filter(ride => {
        if (ride.status !== 'active') return false;
        if (ride.driver.id === user.id) return false; // Don't show own rides
        
        // Simple distance-based matching (in real app, use proper geospatial queries)
        const originDistance = Math.sqrt(
          Math.pow(ride.originCoords[0] - originCoords[0], 2) + 
          Math.pow(ride.originCoords[1] - originCoords[1], 2)
        );
        
        const destDistance = Math.sqrt(
          Math.pow(ride.destCoords[0] - destCoords[0], 2) + 
          Math.pow(ride.destCoords[1] - destCoords[1], 2)
        );

        // Allow some tolerance (roughly 0.01 degrees ≈ 1km)
        return originDistance < 0.01 && destDistance < 0.01;
      });

      // If no exact matches, find similar routes
      if (matchingRides.length === 0) {
        const similarRides = findSimilarRides(allRides, originCoords, destCoords);
        setAvailableRides(similarRides);
        console.log('Found similar rides:', similarRides);
      } else {
        setAvailableRides(matchingRides);
        console.log('Found matching rides:', matchingRides);
      }
      
      // Check for new rides (rides posted in the last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const newRides = availableRides.filter(ride => 
        new Date(ride.createdAt) > fiveMinutesAgo
      );
      
      if (newRides.length > 0) {
        setNewRidesCount(newRides.length);
        // Show notification
        if (Notification.permission === 'granted') {
          new Notification('New Carpool Rides Available!', {
            body: `${newRides.length} new ride(s) found for your route`,
            icon: '/vite.svg'
          });
        }
      }
    } catch (error) {
      console.error('Error finding rides:', error);
      alert('Error searching for rides. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Function to find similar routes when exact matches aren't available
  const findSimilarRides = (allRides, originCoords, destCoords) => {
    const activeRides = allRides.filter(ride => 
      ride.status === 'active' && ride.driver.id !== user.id
    );

    // Calculate similarity scores for each ride
    const ridesWithScores = activeRides.map(ride => {
      const originDistance = Math.sqrt(
        Math.pow(ride.originCoords[0] - originCoords[0], 2) + 
        Math.pow(ride.originCoords[1] - originCoords[1], 2)
      );
      
      const destDistance = Math.sqrt(
        Math.pow(ride.destCoords[0] - destCoords[0], 2) + 
        Math.pow(ride.destCoords[1] - destCoords[1], 2)
      );

      // Calculate route similarity (closer to 0 = more similar)
      const similarityScore = (originDistance + destDistance) / 2;
      
      return {
        ...ride,
        similarityScore,
        originDistance,
        destDistance,
        isExactMatch: originDistance < 0.01 && destDistance < 0.01
      };
    });

    // Sort by similarity and return top 5 most similar rides
    return ridesWithScores
      .sort((a, b) => a.similarityScore - b.similarityScore)
      .slice(0, 5)
      .map(ride => ({
        ...ride,
        isSimilarRoute: !ride.isExactMatch
      }));
  };

  const requestRide = (ride) => {
    const request = {
      id: `req_${Date.now()}`,
      rider: user,
      rideId: ride.id,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Add request to ride using DataService
    const allRides = DataService.getRides();
    const rideIndex = allRides.findIndex(r => r.id === ride.id);
    if (rideIndex !== -1) {
      allRides[rideIndex].requests.push(request);
      // Update the ride in DataService
      const updatedRide = allRides[rideIndex];
      // Remove old ride and add updated one
      const filteredRides = allRides.filter(r => r.id !== ride.id);
      filteredRides.push(updatedRide);
      // Clear and repopulate rides in DataService
      const db = DataService.getDB();
      db.rides = filteredRides;
      DataService.saveDB(db);
    }

    // Remove the ride from available rides (since it now has a pending request)
    setAvailableRides(prev => prev.filter(r => r.id !== ride.id));

    alert(`Ride request sent to ${ride.driver.name}! The driver will be notified.`);
  };

  const acceptRequest = (rideId, requestId) => {
    const allRides = DataService.getRides();
    const rideIndex = allRides.findIndex(r => r.id === rideId);
    if (rideIndex !== -1) {
      const requestIndex = allRides[rideIndex].requests.findIndex(req => req.id === requestId);
      if (requestIndex !== -1) {
        allRides[rideIndex].requests[requestIndex].status = 'accepted';
        allRides[rideIndex].availableSeats -= 1;
        if (allRides[rideIndex].availableSeats <= 0) {
          allRides[rideIndex].status = 'full';
        }
        
        // Update in DataService
        const db = DataService.getDB();
        db.rides = allRides;
        DataService.saveDB(db);
        
        // Update local state
        setMyPostedRides(prev => prev.map(ride => 
          ride.id === rideId ? allRides[rideIndex] : ride
        ));
      }
    }
  };

  const rejectRequest = (rideId, requestId) => {
    const allRides = DataService.getRides();
    const rideIndex = allRides.findIndex(r => r.id === rideId);
    if (rideIndex !== -1) {
      const requestIndex = allRides[rideIndex].requests.findIndex(req => req.id === requestId);
      if (requestIndex !== -1) {
        allRides[rideIndex].requests[requestIndex].status = 'rejected';
        
        // Update in DataService
        const db = DataService.getDB();
        db.rides = allRides;
        DataService.saveDB(db);
        
        // Update local state
        setMyPostedRides(prev => prev.map(ride => 
          ride.id === rideId ? allRides[rideIndex] : ride
        ));
      }
    }
  };

  // Load user's posted rides on component mount
  useEffect(() => {
    if (user) {
      const userRides = DataService.getRides().filter(ride => ride.driver.id === user.id);
      setMyPostedRides(userRides);
    }
  }, [user]);

  // Real-time refresh function
  const refreshAvailableRides = () => {
    if (origin && destination) {
      findAvailableRides();
    }
  };

  // Auto-refresh available rides every 30 seconds
  useEffect(() => {
    if (activeTab === 'find' && origin && destination) {
      const interval = setInterval(() => {
        refreshAvailableRides();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [activeTab, origin, destination]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'find') {
      setNewRidesCount(0); // Clear notification count when switching to Find Rides
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to manual logout
      localStorage.removeItem('currentUser');
      navigate('/login');
    }
  };

  // Geocoding function to convert address to coordinates
  const geocodeAddress = async (address) => {
    try {
      console.log('Geocoding address:', address);
      
      // Remove special characters and clean the address
      const cleanAddress = address.replace(/[^\w\s,.-]/g, ' ').trim();
      
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cleanAddress)}.json?access_token=pk.eyJ1Ijoic2hvY2tlZHJ1bWJsZSIsImEiOiJjbHlycDVwZjEwNnViMmxyMDJ2NXlpeWRiIn0.q8928pDyTpw51xqJouSQrQ&country=PK&types=poi,address,place&limit=5&autocomplete=true`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Geocoding response:', data);
      
      if (!data.features || data.features.length === 0) {
        console.log('No features found for address:', address);
        return [];
      }
      
      return data.features.map(feature => ({
        name: feature.place_name,
        coordinates: feature.center,
        type: feature.place_type[0],
        relevance: feature.relevance
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  };

  // Handle origin input changes
  const handleOriginChange = async (value) => {
    setOrigin(value);
    console.log('🔍 Searching for origin:', value);
    
    if (value.length > 1) { // Reduced from 2 to 1 for faster suggestions
      setIsSearchingLocations(true);
      
      try {
        // Use centralized location search
        const locationMatches = searchLocations(value);
        console.log('📍 Location matches found:', locationMatches.length);
        locationMatches.forEach(match => {
          console.log(`  - ${match.name} (${match.category})`);
        });
        
        // Convert to the expected format
        const predefinedMatches = locationMatches.map(location => ({
          name: location.name,
          coordinates: location.coordinates,
          type: 'predefined',
          relevance: location.relevance,
          category: location.category,
          description: location.description
        }));

        // Get geocoding suggestions
        const geocodingSuggestions = await geocodeAddress(value);
        console.log('🌐 Geocoding suggestions found:', geocodingSuggestions.length);
        
        // Combine and sort by relevance, with predefined locations first
        const allSuggestions = [...predefinedMatches, ...geocodingSuggestions];
        console.log('📋 Total suggestions:', allSuggestions.length);
        
        setOriginSuggestions(allSuggestions);
        setShowOriginSuggestions(allSuggestions.length > 0);
      } catch (error) {
        console.error('Error searching locations:', error);
      } finally {
        setIsSearchingLocations(false);
      }
    } else {
      setOriginSuggestions([]);
      setShowOriginSuggestions(false);
    }
  };

  // Show all locations when origin input is focused
  const handleOriginFocus = async () => {
    console.log('🔍 Origin input focused - showing all locations');
    setIsSearchingLocations(true);
    
    try {
      // Get all locations and convert to suggestions format
      const allLocations = Object.entries(lahoreLocations).map(([key, location]) => ({
        name: location.name,
        coordinates: location.coordinates,
        type: 'predefined',
        relevance: 1,
        category: location.category,
        description: location.description
      }));
      
      // Sort by category and name for better organization
      allLocations.sort((a, b) => {
        if (a.category === b.category) {
          return a.name.localeCompare(b.name);
        }
        return a.category.localeCompare(b.category);
      });
      
      console.log('📍 All locations loaded:', allLocations.length);
      setOriginSuggestions(allLocations);
      setShowOriginSuggestions(true);
    } catch (error) {
      console.error('Error loading all locations:', error);
    } finally {
      setIsSearchingLocations(false);
    }
  };

  // Handle destination input changes
  const handleDestinationChange = async (value) => {
    setDestination(value);
    console.log('🔍 Searching for destination:', value);
    
    if (value.length > 1) { // Reduced from 2 to 1 for faster suggestions
      setIsSearchingLocations(true);
      
      try {
        // Use centralized location search
        const locationMatches = searchLocations(value);
        console.log('📍 Location matches found:', locationMatches.length);
        locationMatches.forEach(match => {
          console.log(`  - ${match.name} (${match.category})`);
        });
        
        // Convert to the expected format
        const predefinedMatches = locationMatches.map(location => ({
          name: location.name,
          coordinates: location.coordinates,
          type: 'predefined',
          relevance: location.relevance,
          category: location.category,
          description: location.description
        }));

        // Get geocoding suggestions
        const geocodingSuggestions = await geocodeAddress(value);
        console.log('🌐 Geocoding suggestions found:', geocodingSuggestions.length);
        
        // Combine and sort by relevance, with predefined locations first
        const allSuggestions = [...predefinedMatches, ...geocodingSuggestions];
        console.log('📋 Total suggestions:', allSuggestions.length);
        
        setDestinationSuggestions(allSuggestions);
        setShowDestinationSuggestions(allSuggestions.length > 0);
      } catch (error) {
        console.error('Error searching locations:', error);
      } finally {
        setIsSearchingLocations(false);
      }
    } else {
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
    }
  };

  // Show all locations when destination input is focused
  const handleDestinationFocus = async () => {
    console.log('🔍 Destination input focused - showing all locations');
    setIsSearchingLocations(true);
    
    try {
      // Get all locations and convert to suggestions format
      const allLocations = Object.entries(lahoreLocations).map(([key, location]) => ({
        name: location.name,
        coordinates: location.coordinates,
        type: 'predefined',
        relevance: 1,
        category: location.category,
        description: location.description
      }));
      
      // Sort by category and name for better organization
      allLocations.sort((a, b) => {
        if (a.category === b.category) {
          return a.name.localeCompare(b.name);
        }
        return a.category.localeCompare(b.category);
      });
      
      console.log('📍 All locations loaded:', allLocations.length);
      setDestinationSuggestions(allLocations);
      setShowDestinationSuggestions(true);
    } catch (error) {
      console.error('Error loading all locations:', error);
    } finally {
      setIsSearchingLocations(false);
    }
  };

  // Select origin suggestion
  const selectOrigin = (suggestion) => {
    setOrigin(suggestion.name);
    setShowOriginSuggestions(false);
    
    // Automatically set coordinates for the selected location
    if (suggestion.coordinates) {
      console.log('Selected origin coordinates:', suggestion.coordinates);
      
      // If destination is also set, automatically search for route
      if (destination) {
        setTimeout(() => {
          handleSearchRoute();
        }, 500);
      }
    }
  };

  // Select destination suggestion
  const selectDestination = (suggestion) => {
    setDestination(suggestion.name);
    setShowDestinationSuggestions(false);
    
    // Automatically set coordinates for the selected location
    if (suggestion.coordinates) {
      console.log('Selected destination coordinates:', suggestion.coordinates);
      
      // If origin is also set, automatically search for route
      if (origin) {
        setTimeout(() => {
          handleSearchRoute();
        }, 500);
      }
    }
  };

  // Get directions between two points
  const getDirections = async (originCoords, destCoords) => {
    try {
      console.log('getDirections called with:', { originCoords, destCoords });
      
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?access_token=pk.eyJ1Ijoic2hvY2tlZHJ1bWJsZSIsImEiOiJjbHlycDVwZjEwNnViMmxyMDJ2NXlpeWRiIn0.q8928pDyTpw51xqJouSQrQ&geometries=geojson&overview=full`;
      console.log('Directions API URL:', url);
      
      const response = await fetch(url);
      console.log('Directions API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Directions API response data:', data);
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates;
        
        // Convert time from seconds to minutes
        const duration = Math.round(route.duration / 60);
        const distance = (route.distance / 1000).toFixed(1);
        
        console.log('Route calculated successfully:', { coordinates: coordinates.length, duration, distance });
        
        return {
          coordinates,
          duration,
          distance
        };
      } else {
        console.error('No routes found in response:', data);
        return null;
      }
    } catch (error) {
      console.error('Directions error:', error);
      return null;
    }
  };

  const handleSearchRoute = async () => {
    if (!origin || !destination) {
      alert('Please enter both origin and destination');
      return;
    }

    setIsSearching(true);
    console.log('Searching route from:', origin, 'to:', destination);

    try {
      let originCoords, destCoords;

      // Check if origin is GPS coordinates
      if (origin.startsWith('GPS:')) {
        const coordsMatch = origin.match(/GPS: ([\d.-]+), ([\d.-]+)/);
        if (coordsMatch) {
          // GPS format is "GPS: lat, lng" but we need [lng, lat] for Mapbox
          const lat = parseFloat(coordsMatch[1]);
          const lng = parseFloat(coordsMatch[2]);
          originCoords = [lng, lat]; // Mapbox expects [longitude, latitude]
          console.log('Using GPS origin coordinates:', originCoords, 'from GPS string:', origin);
        } else {
          alert('Invalid GPS coordinates format.');
          setIsSearching(false);
          return;
        }
      } else {
        // Check if origin is a predefined location
        const originPredefined = Object.entries(predefinedLocations).find(([key, location]) => 
          key.toLowerCase() === origin.toLowerCase() || 
          location.name.toLowerCase() === origin.toLowerCase()
        );

        if (originPredefined) {
          originCoords = originPredefined[1].coordinates;
          console.log('Using predefined origin coordinates:', originCoords);
        } else {
          // Geocode origin
          const originResults = await geocodeAddress(origin);
          if (originResults.length === 0) {
            alert(`Could not find origin location: "${origin}". Please try a more specific address.`);
            setIsSearching(false);
            return;
          }
          originCoords = originResults[0].coordinates;
          console.log('Geocoded origin coordinates:', originCoords);
        }
      }

      // Check if destination is a predefined location
      const destPredefined = Object.entries(predefinedLocations).find(([key, location]) => 
        key.toLowerCase() === destination.toLowerCase() || 
        location.name.toLowerCase() === destination.toLowerCase()
      );

      if (destPredefined) {
        destCoords = destPredefined[1].coordinates;
        console.log('Using predefined destination coordinates:', destCoords);
      } else {
        // Geocode destination
        const destResults = await geocodeAddress(destination);
        if (destResults.length === 0) {
          alert(`Could not find destination location: "${destination}". Please try a more specific address.`);
          setIsSearching(false);
          return;
        }
        destCoords = destResults[0].coordinates;
        console.log('Geocoded destination coordinates:', destCoords);
      }

      // Get directions
      console.log('Getting directions between:', originCoords, 'and:', destCoords);
      const directions = await getDirections(originCoords, destCoords);

      if (directions) {
        console.log('Route found:', directions);
        setRoute({
          origin: origin.startsWith('GPS:') ? 'Current Location' : origin,
          destination: destination,
          coordinates: directions.coordinates,
          originCoords: originCoords,
          destCoords: destCoords
        });
        setEstimatedTime(`${directions.duration} mins`);
        setEstimatedDistance(`${directions.distance} km`);
      } else {
        alert('Could not calculate route. Please try different locations.');
      }
    } catch (error) {
      console.error('Route search error:', error);
      alert('Error calculating route. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Test function to verify route calculation
  const testRouteCalculation = async () => {
    console.log('Testing route calculation...');
    
    // Test with FCC University to Model Town
    const testOrigin = 'FCC University';
    const testDestination = 'Model Town';
    
    const originLoc = lahoreLocations[testOrigin];
    const destLoc = lahoreLocations[testDestination];
    
    if (!originLoc || !destLoc) {
      console.error('Test locations not found');
      return;
    }
    
    console.log('Test coordinates:', {
      origin: originLoc.coordinates,
      destination: destLoc.coordinates
    });
    
    const directions = await getDirections(originLoc.coordinates, destLoc.coordinates);
    
    if (directions) {
      console.log('Test route successful:', directions);
      setRoute({
        origin: testOrigin,
        destination: testDestination,
        coordinates: directions.coordinates,
        originCoords: originLoc.coordinates,
        destCoords: destLoc.coordinates
      });
      setEstimatedTime(`${directions.duration} mins`);
      setEstimatedDistance(`${directions.distance} km`);
    } else {
      console.error('Test route failed');
    }
  };

  // Test Mapbox API access
  const testMapboxAPI = async () => {
    try {
      const response = await fetch(
        'https://api.mapbox.com/geocoding/v5/mapbox.places/Lahore.json?access_token=pk.eyJ1Ijoic2hvY2tlZHJ1bWJsZSIsImEiOiJjbHlycDVwZjEwNnViMmxyMDJ2NXlpeWRiIn0.q8928pDyTpw51xqJouSQrQ&limit=1'
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Mapbox API test successful:', data);
        alert('Mapbox API is working correctly!');
      } else {
        console.error('❌ Mapbox API test failed:', response.status);
        alert('Mapbox API test failed. Check console for details.');
      }
    } catch (error) {
      console.error('❌ Mapbox API test error:', error);
      alert('Mapbox API test error. Check console for details.');
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="text-cyan-400">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <div className="bg-[#1E293B] p-4 border-b border-slate-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-cyan-400">UniPool 🚗</h1>
            <span className="text-slate-400">Welcome, {user.name}</span>
            {currentLocation && (
              <span className="text-green-400 text-sm">📍 GPS Active</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={getCurrentLocation}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              title="Get current location"
            >
              📍 {currentLocation ? 'Update GPS' : 'Enable GPS'}
            </button>
            <button
              onClick={testRouteCalculation}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              title="Test route calculation"
            >
              🧪 Test Route
            </button>
            <button
              onClick={testMapboxAPI}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              title="Test Mapbox API"
            >
              🔧 Test API
            </button>
            <button
              onClick={() => window.testAllLocations && window.testAllLocations()}
              className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              title="Test all locations"
            >
              📍 Test Locations
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#1E293B] p-4 border-b border-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-cyan-400 mb-2">From</label>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => handleOriginChange(e.target.value)}
                    onFocus={handleOriginFocus}
                    onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                    placeholder="Enter pickup location"
                    className="w-full px-4 py-2 bg-[#0F172A] text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400"
                  />
                  {isSearchingLocations && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                    </div>
                  )}
                </div>
                <button
                  onClick={useCurrentLocation}
                  disabled={!currentLocation}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                  title="Use current GPS location"
                >
                  📍 GPS
                </button>
              </div>
              
              {/* Quick Location Buttons */}
              <div className="mt-2 flex flex-wrap gap-1">
                {['FCC University', 'DHA Phase 1', 'Gulberg III', 'Model Town', 'Allama Iqbal Town'].map((place) => (
                  <button
                    key={place}
                    onClick={() => {
                      const location = lahoreLocations[place];
                      if (location) {
                        setOrigin(location.name);
                        if (destination) {
                          setTimeout(() => handleSearchRoute(), 500);
                        }
                      }
                    }}
                    className="px-2 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-600 transition-colors"
                  >
                    {place}
                  </button>
                ))}
              </div>
              
              {showOriginSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-[#0F172A] border border-slate-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {originSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => selectOrigin(suggestion)}
                      className="px-4 py-3 text-white hover:bg-slate-700 cursor-pointer border-b border-slate-600 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-cyan-300">{suggestion.name.split(',')[0]}</div>
                          <div className="text-sm text-slate-400">{suggestion.name}</div>
                          {suggestion.category && (
                            <div className="text-xs text-slate-500 mt-1">
                              📍 {suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}
                            </div>
                          )}
                        </div>
                        {suggestion.type === 'predefined' && (
                          <span className="text-xs bg-cyan-600 text-cyan-100 px-2 py-1 rounded ml-2">
                            📍 Saved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-cyan-400 mb-2">To</label>
              <div className="relative">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => handleDestinationChange(e.target.value)}
                  onFocus={handleDestinationFocus}
                  onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                  placeholder="Enter destination"
                  className="w-full px-4 py-2 bg-[#0F172A] text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400"
                />
                {isSearchingLocations && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                  </div>
                )}
              </div>
              
              {/* Quick Location Buttons for Destination */}
              <div className="mt-2 flex flex-wrap gap-1">
                {['FCC University', 'DHA Phase 1', 'Gulberg III', 'Model Town', 'Allama Iqbal Town'].map((place) => (
                  <button
                    key={place}
                    onClick={() => {
                      const location = lahoreLocations[place];
                      if (location) {
                        setDestination(location.name);
                        if (origin) {
                          setTimeout(() => handleSearchRoute(), 500);
                        }
                      }
                    }}
                    className="px-2 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-600 transition-colors"
                  >
                    {place}
                  </button>
                ))}
              </div>
              
              {showDestinationSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-[#0F172A] border border-slate-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {destinationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => selectDestination(suggestion)}
                      className="px-4 py-3 text-white hover:bg-slate-700 cursor-pointer border-b border-slate-600 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-cyan-300">{suggestion.name.split(',')[0]}</div>
                          <div className="text-sm text-slate-400">{suggestion.name}</div>
                          {suggestion.category && (
                            <div className="text-xs text-slate-500 mt-1">
                              📍 {suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}
                            </div>
                          )}
                        </div>
                        {suggestion.type === 'predefined' && (
                          <span className="text-xs bg-cyan-600 text-cyan-100 px-2 py-1 rounded ml-2">
                            📍 Saved
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSearchRoute}
                disabled={isSearching || !origin || !destination}
                className="py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSearching ? 'Calculating...' : '🗺️ Show Route'}
              </button>
              <button
                onClick={findAvailableRides}
                disabled={isSearching}
                className="py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Find Available Rides'}
              </button>
            </div>

            {/* Route Information */}
            {route && (
              <div className="bg-[#0F172A] p-3 rounded-lg border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-cyan-400 font-medium">📍 Route Found</h4>
                  <div className="text-xs text-slate-400">
                    {estimatedTime} • {estimatedDistance}
                  </div>
                </div>
                <div className="text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>{route.origin}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>{route.destination}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* GPS Tracking Bar */}
      <div className="bg-[#1E293B] p-4 border-b border-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${currentLocation ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-slate-300">
                  {currentLocation ? `GPS Active (${locationUpdateCount} updates)` : 'GPS Inactive'}
                </span>
              </div>
              
              {currentLocation && (
                <span className="text-xs text-slate-400">
                  Lat: {currentLocation.lat.toFixed(4)}, Lng: {currentLocation.lng.toFixed(4)}
                  {currentLocation.accuracy && ` (±${Math.round(currentLocation.accuracy)}m)`}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {!isTracking ? (
                <button
                  onClick={startLocationTracking}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Enable GPS
                </button>
              ) : (
                <button
                  onClick={stopLocationTracking}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Stop GPS
                </button>
              )}
              
              {isRideActive && (
                <div className="flex items-center space-x-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    rideStatus === 'searching' ? 'bg-yellow-600 text-yellow-100' :
                    rideStatus === 'matched' ? 'bg-blue-600 text-blue-100' :
                    rideStatus === 'in-progress' ? 'bg-green-600 text-green-100' :
                    'bg-gray-600 text-gray-100'
                  }`}>
                    {rideStatus === 'searching' ? '🔍 Searching Driver' :
                     rideStatus === 'matched' ? '✅ Driver Found' :
                     rideStatus === 'in-progress' ? '🚗 Ride in Progress' :
                     'Idle'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Carpooling Tabs */}
      <div className="bg-[#1E293B] p-4 border-b border-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex space-x-1 bg-[#0F172A] p-1 rounded-lg">
            <button
              onClick={() => handleTabChange('find')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors relative ${
                activeTab === 'find' 
                  ? 'bg-cyan-500 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔍 Find Rides
              {newRidesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {newRidesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('post')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'post' 
                  ? 'bg-cyan-500 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🚗 Post Ride
            </button>
            <button
              onClick={() => handleTabChange('requests')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'requests' 
                  ? 'bg-cyan-500 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📋 My Rides
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="max-w-6xl mx-auto h-[calc(100vh-16rem)]">
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Container (2/3 width on large screens) */}
            <div 
              ref={mapContainerRef}
              className="lg:col-span-2 bg-[#1E293B] rounded-xl p-4 h-full"
              style={{ 
                minHeight: '400px'
              }}
            >
              <MapboxMap 
                className="h-full"
                route={route}
                currentLocation={currentLocation}
                driverLocation={driverLocation}
                markers={route ? [
                  {
                    coordinates: route.originCoords,
                    title: route.origin,
                    color: '#10B981'
                  },
                  {
                    coordinates: route.destCoords,
                    title: route.destination,
                    color: '#EF4444'
                  }
                ] : []}
              />
            </div>
            
            {/* Sidebar (1/3 width) */}
            <div className="bg-[#1E293B] rounded-xl p-4 overflow-y-auto">
              {/* Debug Status Section */}
              <div className="mb-4 p-3 bg-[#0F172A] rounded-lg border border-slate-600">
                <h3 className="text-sm font-medium text-cyan-400 mb-2">🔧 Debug Status</h3>
                <div className="text-xs space-y-1 text-slate-300">
                  <div>📍 GPS: {currentLocation ? `Active (${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)})` : 'Inactive'}</div>
                  <div>🗺️ Route: {route ? 'Loaded' : 'None'}</div>
                  <div>🚗 Rides: {availableRides.length} available</div>
                  <div>📱 Tab: {activeTab}</div>
                </div>
              </div>

              {activeTab === 'find' && (
                <div>
                  <h2 className="text-xl font-bold text-cyan-400 mb-4">Find Rides</h2>
                  
                  {/* Search Interface */}
                  <div className="space-y-4 mb-6">
                    <div className="relative">
                      <label className="block text-sm font-medium text-cyan-400 mb-2">From</label>
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={origin}
                            onChange={(e) => handleOriginChange(e.target.value)}
                            onFocus={handleOriginFocus}
                            onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                            placeholder="Enter pickup location"
                            className="w-full px-4 py-2 bg-[#0F172A] text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400"
                          />
                          {isSearchingLocations && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={useCurrentLocation}
                          disabled={!currentLocation}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                          title="Use current GPS location"
                        >
                          📍 GPS
                        </button>
                      </div>
                      
                      {/* Quick Location Buttons */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {['FCC University', 'DHA Phase 1', 'Gulberg III', 'Model Town', 'Allama Iqbal Town'].map((place) => (
                          <button
                            key={place}
                            onClick={() => {
                              const location = lahoreLocations[place];
                              if (location) {
                                setOrigin(location.name);
                                if (destination) {
                                  setTimeout(() => handleSearchRoute(), 500);
                                }
                              }
                            }}
                            className="px-2 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-600 transition-colors"
                          >
                            {place}
                          </button>
                        ))}
                      </div>
                      
                      {showOriginSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-[#0F172A] border border-slate-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {originSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              onClick={() => selectOrigin(suggestion)}
                              className="px-4 py-3 text-white hover:bg-slate-700 cursor-pointer border-b border-slate-600 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-cyan-300">{suggestion.name.split(',')[0]}</div>
                                  <div className="text-sm text-slate-400">{suggestion.name}</div>
                                  {suggestion.category && (
                                    <div className="text-xs text-slate-500 mt-1">
                                      📍 {suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}
                                    </div>
                                  )}
                                </div>
                                {suggestion.type === 'predefined' && (
                                  <span className="text-xs bg-cyan-600 text-cyan-100 px-2 py-1 rounded ml-2">
                                    📍 Saved
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-cyan-400 mb-2">To</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={destination}
                          onChange={(e) => handleDestinationChange(e.target.value)}
                          onFocus={handleDestinationFocus}
                          onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                          placeholder="Enter destination"
                          className="w-full px-4 py-2 bg-[#0F172A] text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400"
                        />
                        {isSearchingLocations && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                          </div>
                        )}
                      </div>
                      
                      {showDestinationSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-[#0F172A] border border-slate-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {destinationSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              onClick={() => selectDestination(suggestion)}
                              className="px-4 py-3 text-white hover:bg-slate-700 cursor-pointer border-b border-slate-600 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-cyan-300">{suggestion.name.split(',')[0]}</div>
                                  <div className="text-sm text-slate-400">{suggestion.name}</div>
                                  {suggestion.category && (
                                    <div className="text-xs text-slate-500 mt-1">
                                      📍 {suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}
                                    </div>
                                  )}
                                </div>
                                {suggestion.type === 'predefined' && (
                                  <span className="text-xs bg-cyan-600 text-cyan-100 px-2 py-1 rounded ml-2">
                                    📍 Saved
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleSearchRoute}
                        disabled={isSearching || !origin || !destination}
                        className="py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isSearching ? 'Calculating...' : '🗺️ Show Route'}
                      </button>
                      <button
                        onClick={findAvailableRides}
                        disabled={isSearching}
                        className="py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
                      >
                        {isSearching ? 'Searching...' : 'Find Available Rides'}
                      </button>
                    </div>

                    {/* Route Information */}
                    {route && (
                      <div className="bg-[#0F172A] p-3 rounded-lg border border-cyan-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-cyan-400 font-medium">📍 Route Found</h4>
                          <div className="text-xs text-slate-400">
                            {estimatedTime} • {estimatedDistance}
                          </div>
                        </div>
                        <div className="text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>{route.origin}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>{route.destination}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Available Rides */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-white">Available Rides</h3>
                      <button
                        onClick={refreshAvailableRides}
                        disabled={!origin || !destination}
                        className="px-3 py-1 bg-cyan-600 text-white rounded text-sm hover:bg-cyan-700 transition-colors disabled:opacity-50"
                        title="Refresh available rides"
                      >
                        🔄 Refresh
                      </button>
                    </div>
                    
                    {/* Show message when only similar routes are available */}
                    {availableRides.length > 0 && availableRides.every(ride => ride.isSimilarRoute) && (
                      <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-400 mb-1">
                          <span>🔄</span>
                          <span className="font-medium">No exact matches found</span>
                        </div>
                        <p className="text-sm text-yellow-300 mb-3">
                          Showing similar routes that might work for you. Contact drivers to arrange pickup/drop-off details.
                        </p>
                        <button
                          onClick={() => setActiveTab('post')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          🚗 Post Your Exact Route
                        </button>
                      </div>
                    )}
                    
                    {availableRides.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-slate-400 text-sm mb-4">No rides available for this route.</p>
                        <button
                          onClick={() => setActiveTab('post')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          🚗 Post Your Own Ride
                        </button>
                        <p className="text-xs text-slate-500 mt-2">
                          Help others by sharing your ride!
                        </p>
                      </div>
                    ) : (
                      availableRides.map((ride) => (
                        <div key={ride.id} className={`bg-[#0F172A] p-3 rounded-lg ${ride.isSimilarRoute ? 'border border-yellow-500/30' : 'border border-green-500/30'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-white font-medium">{ride.driver.name}</div>
                              <div className="text-slate-400 text-sm">⭐ {ride.driver.ratings?.driver?.average || 4.5}</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="text-green-400 font-bold">🆓 Free</div>
                              {ride.isSimilarRoute && (
                                <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded">
                                  🔄 Similar Route
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-slate-300 mb-2">
                            <div>📍 {ride.origin} → {ride.destination}</div>
                            <div>📅 Posted: {ride.date} at {ride.time}</div>
                            <div>💺 {ride.availableSeats} seats available</div>
                            {ride.isSimilarRoute && (
                              <div className="text-xs text-yellow-400 mt-1">
                                ⚠️ This route is similar but not exact. Contact driver for pickup/drop-off details.
                              </div>
                            )}
                          </div>
                          {ride.description && (
                            <div className="text-xs text-slate-400 mb-2">{ride.description}</div>
                          )}
                          <button
                            onClick={() => requestRide(ride)}
                            className={`w-full py-1 text-white rounded text-sm transition-colors ${
                              ride.isSimilarRoute 
                                ? 'bg-yellow-600 hover:bg-yellow-700' 
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                          >
                            {ride.isSimilarRoute ? 'Request Similar Ride' : 'Request Ride'}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'post' && (
                <div>
                  <h2 className="text-xl font-bold text-cyan-400 mb-4">Post a Ride</h2>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-cyan-400 mb-2">From</label>
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={origin}
                            onChange={(e) => handleOriginChange(e.target.value)}
                            onFocus={handleOriginFocus}
                            onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                            placeholder="Enter pickup location"
                            className="w-full px-4 py-2 bg-[#0F172A] text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400"
                          />
                          {isSearchingLocations && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={useCurrentLocation}
                          disabled={!currentLocation}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                          title="Use current GPS location"
                        >
                          📍 GPS
                        </button>
                      </div>
                      
                      {/* Quick Location Buttons */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {['FCC University', 'DHA Phase 1', 'Gulberg III', 'Model Town', 'Allama Iqbal Town'].map((place) => (
                          <button
                            key={place}
                            onClick={() => {
                              const location = lahoreLocations[place];
                              if (location) {
                                setOrigin(location.name);
                                if (destination) {
                                  setTimeout(() => handleSearchRoute(), 500);
                                }
                              }
                            }}
                            className="px-2 py-1 bg-slate-700 text-white text-xs rounded hover:bg-slate-600 transition-colors"
                          >
                            {place}
                          </button>
                        ))}
                      </div>
                      
                      {showOriginSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-[#0F172A] border border-slate-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {originSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              onClick={() => selectOrigin(suggestion)}
                              className="px-4 py-3 text-white hover:bg-slate-700 cursor-pointer border-b border-slate-600 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-cyan-300">{suggestion.name.split(',')[0]}</div>
                                  <div className="text-sm text-slate-400">{suggestion.name}</div>
                                  {suggestion.category && (
                                    <div className="text-xs text-slate-500 mt-1">
                                      📍 {suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}
                                    </div>
                                  )}
                                </div>
                                {suggestion.type === 'predefined' && (
                                  <span className="text-xs bg-cyan-600 text-cyan-100 px-2 py-1 rounded ml-2">
                                    📍 Saved
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-cyan-400 mb-2">To</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={destination}
                          onChange={(e) => handleDestinationChange(e.target.value)}
                          onFocus={handleDestinationFocus}
                          onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                          placeholder="Enter destination"
                          className="w-full px-4 py-2 bg-[#0F172A] text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400"
                        />
                        {isSearchingLocations && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                          </div>
                        )}
                      </div>
                      
                      {showDestinationSuggestions && (
                        <div className="absolute z-10 w-full mt-1 bg-[#0F172A] border border-slate-600 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          {destinationSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              onClick={() => selectDestination(suggestion)}
                              className="px-4 py-3 text-white hover:bg-slate-700 cursor-pointer border-b border-slate-600 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-cyan-300">{suggestion.name.split(',')[0]}</div>
                                  <div className="text-sm text-slate-400">{suggestion.name}</div>
                                  {suggestion.category && (
                                    <div className="text-xs text-slate-500 mt-1">
                                      📍 {suggestion.category.charAt(0).toUpperCase() + suggestion.category.slice(1)}
                                    </div>
                                  )}
                                </div>
                                {suggestion.type === 'predefined' && (
                                  <span className="text-xs bg-cyan-600 text-cyan-100 px-2 py-1 rounded ml-2">
                                    📍 Saved
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-cyan-400 mb-2">Available Seats</label>
                        <select
                          value={availableSeats}
                          onChange={(e) => setAvailableSeats(parseInt(e.target.value))}
                          className="w-full px-4 py-2 bg-[#0F172A] text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400"
                        >
                          <option value={1}>1 seat</option>
                          <option value={2}>2 seats</option>
                          <option value={3}>3 seats</option>
                          <option value={4}>4 seats</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cyan-400 mb-2">Ride Type</label>
                        <div className="px-4 py-2 bg-green-600 text-white rounded-lg text-center">
                          🆓 Free Student Ride
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cyan-400 mb-2">Description (Optional)</label>
                      <textarea
                        value={rideDescription}
                        onChange={(e) => setRideDescription(e.target.value)}
                        placeholder="Any additional details about your ride..."
                        rows={3}
                        className="w-full px-4 py-2 bg-[#0F172A] text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleSearchRoute}
                        disabled={isSearching || !origin || !destination}
                        className="py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isSearching ? 'Calculating...' : '🗺️ Show Route'}
                      </button>
                      <button
                        onClick={postRide}
                        disabled={isPostingRide || !origin || !destination}
                        className="py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {isPostingRide ? 'Posting...' : 'Post Ride'}
                      </button>
                    </div>

                    {/* Route Information */}
                    {route && (
                      <div className="bg-[#0F172A] p-3 rounded-lg border border-green-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-green-400 font-medium">📍 Route Preview</h4>
                          <div className="text-xs text-slate-400">
                            {estimatedTime} • {estimatedDistance}
                          </div>
                        </div>
                        <div className="text-sm text-slate-300">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>{route.origin}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>{route.destination}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'requests' && (
                <div>
                  <h2 className="text-xl font-bold text-cyan-400 mb-4">My Rides</h2>
                  
                  <div className="space-y-4">
                    {myPostedRides.length === 0 ? (
                      <p className="text-slate-400 text-sm">You haven't posted any rides yet.</p>
                    ) : (
                      myPostedRides.map((ride) => (
                        <div key={ride.id} className="bg-[#0F172A] p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-white font-medium">{ride.origin} → {ride.destination}</div>
                              <div className="text-slate-400 text-sm">📅 Posted: {ride.date} at {ride.time}</div>
                              <div className="text-green-400 font-bold">🆓 Free Ride</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${
                              ride.status === 'active' ? 'bg-green-600 text-green-100' :
                              ride.status === 'full' ? 'bg-yellow-600 text-yellow-100' :
                              'bg-gray-600 text-gray-100'
                            }`}>
                              {ride.status}
                            </div>
                          </div>
                          
                          {ride.requests.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm text-cyan-400 mb-2">Ride Requests ({ride.requests.length})</div>
                              {ride.requests.map((request) => (
                                <div key={request.id} className="bg-[#1E293B] p-2 rounded mb-2">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <div className="text-white text-sm">{request.rider.name}</div>
                                      <div className="text-slate-400 text-xs">{request.rider.email}</div>
                                    </div>
                                    <div className="flex space-x-1">
                                      {request.status === 'pending' && (
                                        <>
                                          <button
                                            onClick={() => acceptRequest(ride.id, request.id)}
                                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                                          >
                                            Accept
                                          </button>
                                          <button
                                            onClick={() => rejectRequest(ride.id, request.id)}
                                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                                          >
                                            Reject
                                          </button>
                                        </>
                                      )}
                                      {request.status === 'accepted' && (
                                        <span className="px-2 py-1 bg-green-600 text-white rounded text-xs">Accepted</span>
                                      )}
                                      {request.status === 'rejected' && (
                                        <span className="px-2 py-1 bg-red-600 text-white rounded text-xs">Rejected</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
   </div>
  );
}