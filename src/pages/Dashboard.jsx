import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MapboxMap from '../components/map/MapboxMap';

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

  useEffect(() => {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

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

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
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

  // Predefined locations for common places
  const predefinedLocations = {
    'FCC University': {
      name: 'Forman Christian College University, Lahore',
      coordinates: [74.331627, 31.522381]
    },
    'Hafeez Centre': {
      name: 'Hafeez Centre, Gulberg III, Lahore',
      coordinates: [74.343, 31.5155]
    },
    'Mall Road': {
      name: 'Mall Road, Lahore',
      coordinates: [74.3436, 31.4662]
    },
    'DHA Phase 1': {
      name: 'DHA Phase 1, Lahore',
      coordinates: [74.3800, 31.4800]
    },
    'Lahore Airport': {
      name: 'Allama Iqbal International Airport, Lahore',
      coordinates: [74.4036, 31.5216]
    }
  };

  // Handle origin input changes
  const handleOriginChange = async (value) => {
    setOrigin(value);
    if (value.length > 2) {
      // Check predefined locations first
      const predefinedMatches = Object.entries(predefinedLocations)
        .filter(([key, location]) => 
          key.toLowerCase().includes(value.toLowerCase()) ||
          location.name.toLowerCase().includes(value.toLowerCase())
        )
        .map(([key, location]) => ({
          name: location.name,
          coordinates: location.coordinates,
          type: 'predefined',
          relevance: 1
        }));

      // Get geocoding suggestions
      const geocodingSuggestions = await geocodeAddress(value);
      
      // Combine and sort by relevance
      const allSuggestions = [...predefinedMatches, ...geocodingSuggestions];
      setOriginSuggestions(allSuggestions);
      setShowOriginSuggestions(allSuggestions.length > 0);
    } else {
      setOriginSuggestions([]);
      setShowOriginSuggestions(false);
    }
  };

  // Handle destination input changes
  const handleDestinationChange = async (value) => {
    setDestination(value);
    if (value.length > 2) {
      // Check predefined locations first
      const predefinedMatches = Object.entries(predefinedLocations)
        .filter(([key, location]) => 
          key.toLowerCase().includes(value.toLowerCase()) ||
          location.name.toLowerCase().includes(value.toLowerCase())
        )
        .map(([key, location]) => ({
          name: location.name,
          coordinates: location.coordinates,
          type: 'predefined',
          relevance: 1
        }));

      // Get geocoding suggestions
      const geocodingSuggestions = await geocodeAddress(value);
      
      // Combine and sort by relevance
      const allSuggestions = [...predefinedMatches, ...geocodingSuggestions];
      setDestinationSuggestions(allSuggestions);
      setShowDestinationSuggestions(allSuggestions.length > 0);
    } else {
      setDestinationSuggestions([]);
      setShowDestinationSuggestions(false);
    }
  };

  // Select origin suggestion
  const selectOrigin = (suggestion) => {
    setOrigin(suggestion.name);
    setOriginSuggestions([]);
    setShowOriginSuggestions(false);
  };

  // Select destination suggestion
  const selectDestination = (suggestion) => {
    setDestination(suggestion.name);
    setDestinationSuggestions([]);
    setShowDestinationSuggestions(false);
  };

  // Get directions between two points
  const getDirections = async (originCoords, destCoords) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?access_token=pk.eyJ1Ijoic2hvY2tlZHJ1bWJsZSIsImEiOiJjbHlycDVwZjEwNnViMmxyMDJ2NXlpeWRiIn0.q8928pDyTpw51xqJouSQrQ&geometries=geojson&overview=full`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates;
        
        // Convert time from seconds to minutes
        const duration = Math.round(route.duration / 60);
        const distance = (route.distance / 1000).toFixed(1);
        
        return {
          coordinates,
          duration,
          distance
        };
      }
      return null;
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
          origin: origin,
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
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#1E293B] p-4 border-b border-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-cyan-400 mb-2">From</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => handleOriginChange(e.target.value)}
                onFocus={() => setShowOriginSuggestions(originSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowOriginSuggestions(false), 200)}
                placeholder="Enter pickup location"
                className="w-full px-4 py-2 bg-[#0F172A] text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400"
              />
              {showOriginSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-[#0F172A] border border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {originSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => selectOrigin(suggestion)}
                      className="px-4 py-2 text-white hover:bg-slate-700 cursor-pointer border-b border-slate-600 last:border-b-0"
                    >
                      <div className="font-medium">{suggestion.name.split(',')[0]}</div>
                      <div className="text-sm text-slate-400">{suggestion.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              <label className="block text-sm font-medium text-cyan-400 mb-2">To</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                onFocus={() => setShowDestinationSuggestions(destinationSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowDestinationSuggestions(false), 200)}
                placeholder="Enter destination"
                className="w-full px-4 py-2 bg-[#0F172A] text-white border border-slate-600 rounded-lg focus:outline-none focus:border-cyan-400"
              />
              {showDestinationSuggestions && (
                <div className="absolute z-10 w-full mt-1 bg-[#0F172A] border border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {destinationSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => selectDestination(suggestion)}
                      className="px-4 py-2 text-white hover:bg-slate-700 cursor-pointer border-b border-slate-600 last:border-b-0"
                    >
                      <div className="font-medium">{suggestion.name.split(',')[0]}</div>
                      <div className="text-sm text-slate-400">{suggestion.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleSearchRoute}
              disabled={isSearching}
              className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Find Route'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="max-w-6xl mx-auto h-[calc(100vh-12rem)]">
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
                markers={[
                  {
                    position: [74.331627, 31.522381], // FCC University Lahore - CORRECT COORDINATES
                    content: '<h3 class="text-cyan-400">FCC University</h3><p class="text-sm">Forman Christian College University, Lahore</p><p class="text-xs text-gray-400">Ferozepur Road, Lahore</p>',
                    autoOpenPopup: false // Changed to false to prevent interference
                  }
                ]}
                route={route}
                className="h-full"
              />
            </div>
            
            {/* Sidebar (1/3 width) */}
            <div className="bg-[#1E293B] rounded-xl p-4">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">Trip Details</h2>
              
              {route ? (
                <div className="space-y-4">
                  <div className="bg-[#0F172A] p-3 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Route Information</h3>
                    <div className="space-y-2 text-sm text-slate-300">
                      <div><span className="text-cyan-400">From:</span> {route.origin}</div>
                      <div><span className="text-cyan-400">To:</span> {route.destination}</div>
                      <div><span className="text-cyan-400">Time:</span> {estimatedTime}</div>
                      <div><span className="text-cyan-400">Distance:</span> {estimatedDistance}</div>
                    </div>
                  </div>
                  
                  <button className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Book Ride
                  </button>
                </div>
              ) : (
                <div className="text-slate-400 text-sm">
                  <p>Enter your destination to see available rides.</p>
                  <p className="mt-2">Popular destinations:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• FCC University</li>
                    <li>• Hafeez Centre</li>
                    <li>• Mall Road</li>
                    <li>• DHA Phase 1</li>
                  </ul>
                  
                  <div className="mt-4">
                    <p className="text-cyan-400 font-medium mb-2">Quick Routes:</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setOrigin('Hafeez Centre');
                          setDestination('FCC University');
                        }}
                        className="w-full py-2 px-3 bg-slate-700 text-white rounded text-sm hover:bg-slate-600 transition-colors"
                      >
                        Hafeez Centre → FCC University
                      </button>
                      <button
                        onClick={() => {
                          setOrigin('Mall Road');
                          setDestination('DHA Phase 1');
                        }}
                        className="w-full py-2 px-3 bg-slate-700 text-white rounded text-sm hover:bg-slate-600 transition-colors"
                      >
                        Mall Road → DHA Phase 1
                      </button>
                      <button
                        onClick={() => {
                          setOrigin('Lahore Airport');
                          setDestination('FCC University');
                        }}
                        className="w-full py-2 px-3 bg-slate-700 text-white rounded text-sm hover:bg-slate-600 transition-colors"
                      >
                        Airport → FCC University
                      </button>
                    </div>
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