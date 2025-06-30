'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Users, MapPin, Clock, Star, Search, Navigation, UserIcon, ArrowLeft } from 'lucide-react';
import { AuthService } from '@/services/AuthService';
import { RideService } from '@/services/RideService';
import { mapService } from '@/services/MapService';
import { LocationSuggestion, Route, CurrentLocation, MapMarker } from '@/types/map';
import dynamic from 'next/dynamic';

// Dynamic imports for map components
const MapboxMap = dynamic(() => import('@/components/map/MapboxMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-gray-600">Loading map...</div>
    </div>
  )
});

const LocationSearch = dynamic(() => import('@/components/map/LocationSearch'), {
  ssr: false
});

export default function SearchRidesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [availableRides, setAvailableRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [route, setRoute] = useState(null);
  const [isSearchingRoute, setIsSearchingRoute] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [estimatedDistance, setEstimatedDistance] = useState(null);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [activeTab, setActiveTab] = useState('map'); // 'map' or 'list'

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
    loadAvailableRides();
    getCurrentLocation();
  }, [router]);

  const getCurrentLocation = async () => {
    try {
      const location = await mapService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const loadAvailableRides = async () => {
    try {
      setIsLoading(true);
      const rides = await RideService.getAvailableRides(user?.id);
      setAvailableRides(rides);
      setFilteredRides(rides);
      updateMapMarkers(rides);
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMapMarkers = (rides) => {
    const markers = rides.map((ride, index) => ({
      coordinates: [ride.originLng || 74.331627, ride.originLat || 31.522381],
      title: `${ride.driver?.name || 'Driver'} - ${ride.origin} to ${ride.destination}`,
      color: '#3B82F6',
      description: `Departure: ${new Date(ride.departureTime).toLocaleString()}`
    }));
    setMapMarkers(markers);
  };

  const handleOriginChange = async (value) => {
    setOrigin(value);
    if (value.length >= 2) {
      try {
        const suggestions = await mapService.getAddressSuggestions(value);
        setOriginSuggestions(suggestions);
        setShowOriginSuggestions(true);
      } catch (error) {
        console.error('Error getting origin suggestions:', error);
      }
    } else {
      setOriginSuggestions([]);
      setShowOriginSuggestions(false);
    }
  };

  const handleDestinationChange = async (value) => {
    setDestination(value);
    if (value.length >= 2) {
      try {
        const suggestions = await mapService.getAddressSuggestions(value);
        setDestinationSuggestions(suggestions);
        setShowDestinationSuggestions(true);
      } catch (error) {
        console.error('Error getting destination suggestions:', error);
      }
    } else {
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
    }
  };

  const handleOriginSelect = (suggestion) => {
    setOrigin(suggestion.name);
    setShowOriginSuggestions(false);
    if (destination) {
      searchRoute();
    }
  };

  const handleDestinationSelect = (suggestion) => {
    setDestination(suggestion.name);
    setShowDestinationSuggestions(false);
    if (origin) {
      searchRoute();
    }
  };

  const searchRoute = async () => {
    if (!origin || !destination) return;

    setIsSearchingRoute(true);
    try {
      // Get coordinates for origin and destination
      const originResult = await mapService.geocodeAddress(origin);
      const destResult = await mapService.geocodeAddress(destination);

      if (originResult && destResult) {
        const directions = await mapService.getDirections(
          originResult.coordinates,
          destResult.coordinates
        );

        if (directions) {
          setRoute({
            origin: origin,
            destination: destination,
            coordinates: directions.coordinates,
            originCoords: originResult.coordinates,
            destCoords: destResult.coordinates,
            distance: directions.distance,
            duration: directions.duration
          });
          setEstimatedTime(`${Math.round(directions.duration)} mins`);
          setEstimatedDistance(`${directions.distance.toFixed(1)} km`);

          // Filter rides based on route
          filterRidesByRoute(originResult.coordinates, destResult.coordinates);
        }
      }
    } catch (error) {
      console.error('Error searching route:', error);
    } finally {
      setIsSearchingRoute(false);
    }
  };

  const filterRidesByRoute = (originCoords, destCoords) => {
    const filtered = availableRides.filter(ride => {
      // Simple distance-based filtering
      const rideOriginDist = mapService.calculateDistance(
        originCoords,
        [ride.originLng || 74.331627, ride.originLat || 31.522381]
      );
      const rideDestDist = mapService.calculateDistance(
        destCoords,
        [ride.destinationLng || 74.331627, ride.destinationLat || 31.522381]
      );

      return rideOriginDist < 5 && rideDestDist < 5; // Within 5km
    });

    setFilteredRides(filtered);
    updateMapMarkers(filtered);
  };

  const handleUseCurrentLocation = async () => {
    if (currentLocation) {
      try {
        const result = await mapService.geocodeAddress(
          `${currentLocation.lat}, ${currentLocation.lng}`
        );
        if (result) {
          setOrigin('Current Location');
          handleOriginSelect({
            name: 'Current Location',
            coordinates: [currentLocation.lng, currentLocation.lat]
          });
        }
      } catch (error) {
        console.error('Error using current location:', error);
      }
    } else {
      await getCurrentLocation();
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Karachi',
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'Asia/Karachi',
    });
  };

  const handleBookRide = async (rideId) => {
    try {
      await RideService.bookRide(rideId, user.id);
      alert('Ride booked successfully!');
      loadAvailableRides(); // Refresh the list
    } catch (error) {
      console.error('Error booking ride:', error);
      alert('Failed to book ride. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Find a Ride</h1>
                <p className="text-gray-600">Search for rides that match your schedule and location</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Interface */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search Rides</span>
            </CardTitle>
            <CardDescription>
              Enter your origin and destination to find available rides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">From</label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <LocationSearch
                      value={origin}
                      onChange={handleOriginChange}
                      onSelect={handleOriginSelect}
                      placeholder="Enter pickup location"
                      suggestions={originSuggestions}
                      showSuggestions={showOriginSuggestions}
                      isLoading={isSearchingRoute}
                    />
                  </div>
                  <Button
                    onClick={handleUseCurrentLocation}
                    disabled={!currentLocation}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    <Navigation className="h-4 w-4 mr-1" />
                    GPS
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">To</label>
                <LocationSearch
                  value={destination}
                  onChange={handleDestinationChange}
                  onSelect={handleDestinationSelect}
                  placeholder="Enter destination"
                  suggestions={destinationSuggestions}
                  showSuggestions={showDestinationSuggestions}
                  isLoading={isSearchingRoute}
                />
              </div>
            </div>

            <Button
              onClick={searchRoute}
              disabled={!origin || !destination || isSearchingRoute}
              className="w-full"
            >
              {isSearchingRoute ? 'Searching...' : 'Search Rides'}
            </Button>

            {/* Route Information */}
            {route && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-blue-900">Route Found</h4>
                  <div className="text-sm text-blue-700">
                    {estimatedTime} • {estimatedDistance}
                  </div>
                </div>
                <div className="text-sm text-blue-800">
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
          </CardContent>
        </Card>

        {/* View Toggle */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Map View</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center space-x-2">
                <Car className="h-4 w-4" />
                <span>List View</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <TabsContent value="map" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2 h-[600px]">
              <MapboxMap
                route={route}
                currentLocation={currentLocation}
                markers={mapMarkers}
                className="h-full"
              />
            </div>

            {/* Ride List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Available Rides ({filteredRides.length})
              </h3>
              {filteredRides.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No rides available for this route</p>
                  </CardContent>
                </Card>
              ) : (
                filteredRides.map((ride) => (
                  <Card key={ride.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{ride.driver?.name}</h4>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{ride.driver?.rating || 4.5}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">Free</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{ride.origin} → {ride.destination}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(ride.departureTime)} at {formatTime(ride.departureTime)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{ride.availableSeats} seats available</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleBookRide(ride.id)}
                        className="w-full mt-3"
                        size="sm"
                      >
                        Book Ride
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading rides...</p>
            </div>
          ) : filteredRides.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rides found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or check back later</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRides.map((ride) => (
                <Card key={ride.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{ride.driver?.name}</h4>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{ride.driver?.rating || 4.5}</span>
                        </div>
                      </div>
                      <Badge variant="secondary">Free</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{ride.origin} → {ride.destination}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(ride.departureTime)} at {formatTime(ride.departureTime)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{ride.availableSeats} seats available</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleBookRide(ride.id)}
                      className="w-full mt-3"
                      size="sm"
                    >
                      Book Ride
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </div>
    </div>
  );
} 