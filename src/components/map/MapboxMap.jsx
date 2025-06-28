import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapboxMap.css';

// Initialize Mapbox (move to .env in production)
mapboxgl.accessToken = 'pk.eyJ1Ijoic2hvY2tlZHJ1bWJsZSIsImEiOiJjbHlycDVwZjEwNnViMmxyMDJ2NXlpeWRiIn0.q8928pDyTpw51xqJouSQrQ';

const MapboxMap = ({
  initialView = {
    lng: 74.331627, // FCC University Lahore coordinates
    lat: 31.522381,
    zoom: 15
  },
  markers = [],
  route = null,
  currentLocation = null,
  driverLocation = null,
  onMapLoad,
  interactive = true,
  className = ''
}) => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routeSourceId, setRouteSourceId] = useState(null);
  const [markerElements, setMarkerElements] = useState([]);

  // Initialize map
  useEffect(() => {
    console.log('MapboxMap: Component mounted');
    
    if (!mapContainer.current) {
      console.error('MapboxMap: No container ref');
      setError('No container element found');
      return;
    }

    try {
      console.log('MapboxMap: Creating map...');
      
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [initialView.lng, initialView.lat],
        zoom: initialView.zoom,
        interactive
      });

      console.log('MapboxMap: Map instance created');

      // Add controls
      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Handle map load
      newMap.on('load', () => {
        console.log('MapboxMap: Map loaded successfully');
        setMap(newMap);
        setLoading(false);
        if (onMapLoad) onMapLoad(newMap);
      });

      // Handle map errors
      newMap.on('error', (e) => {
        console.error('MapboxMap: Map error:', e);
        setError(e.error || 'Map failed to load');
        setLoading(false);
      });

      // Cleanup
      return () => {
        console.log('MapboxMap: Cleaning up map');
        if (newMap) {
          newMap.remove();
        }
        setMap(null);
        setLoading(false);
      };
    } catch (error) {
      console.error('MapboxMap: Error initializing map:', error);
      setError(error.message);
      setLoading(false);
    }
  }, []);

  // Handle route display
  useEffect(() => {
    if (!map || !route) return;

    console.log('MapboxMap: Adding route to map:', route);

    // Remove existing route if any
    if (routeSourceId) {
      if (map.getSource(routeSourceId)) {
        map.removeLayer(`${routeSourceId}-layer`);
        map.removeSource(routeSourceId);
      }
    }

    // Create unique source ID
    const sourceId = `route-${Date.now()}`;
    setRouteSourceId(sourceId);

    // Add route source
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates
        }
      }
    });

    // Add route layer
    map.addLayer({
      id: `${sourceId}-layer`,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3B82F6',
        'line-width': 4,
        'line-opacity': 0.8
      }
    });

    // Fit map to route bounds
    if (route.coordinates.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      route.coordinates.forEach(coord => {
        bounds.extend(coord);
      });
      map.fitBounds(bounds, {
        padding: 50,
        duration: 1000
      });
    }

    // Cleanup function
    return () => {
      if (map && map.getSource(sourceId)) {
        if (map.getLayer(`${sourceId}-layer`)) {
          map.removeLayer(`${sourceId}-layer`);
        }
        map.removeSource(sourceId);
      }
    };
  }, [map, route]);

  // Handle markers
  useEffect(() => {
    if (!map) return;

    // Remove existing markers
    markerElements.forEach(marker => marker.remove());
    setMarkerElements([]);

    // Add new markers
    const newMarkers = markers.map((marker, index) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = marker.color || '#3B82F6';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.title = marker.title || `Marker ${index + 1}`;

      const mapboxMarker = new mapboxgl.Marker(el)
        .setLngLat(marker.coordinates)
        .addTo(map);

      return mapboxMarker;
    });

    setMarkerElements(newMarkers);

    // Cleanup
    return () => {
      newMarkers.forEach(marker => marker.remove());
    };
  }, [map, markers]);

  // Handle current location marker
  useEffect(() => {
    if (!map || !currentLocation) return;

    console.log('MapboxMap: Adding current location marker:', currentLocation);

    const el = document.createElement('div');
    el.className = 'current-location-marker';
    el.style.backgroundColor = '#10B981';
    el.style.width = '16px';
    el.style.height = '16px';
    el.style.borderRadius = '50%';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 0 0 2px #10B981';

    const marker = new mapboxgl.Marker(el)
      .setLngLat([currentLocation.lng, currentLocation.lat])
      .addTo(map);

    console.log('MapboxMap: Current location marker added at:', [currentLocation.lng, currentLocation.lat]);

    return () => {
      console.log('MapboxMap: Removing current location marker');
      marker.remove();
    };
  }, [map, currentLocation]);

  // Handle driver location marker
  useEffect(() => {
    if (!map || !driverLocation) return;

    const el = document.createElement('div');
    el.className = 'driver-location-marker';
    el.style.backgroundColor = '#F59E0B';
    el.style.width = '18px';
    el.style.height = '18px';
    el.style.borderRadius = '50%';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 0 0 2px #F59E0B';

    const marker = new mapboxgl.Marker(el)
      .setLngLat([driverLocation.lng, driverLocation.lat])
      .addTo(map);

    return () => marker.remove();
  }, [map, driverLocation]);

  if (error) {
    return (
      <div className={`map-container ${className}`}>
        <div className="flex items-center justify-center h-full bg-red-100 text-red-800 p-4">
          <div>
            <h3 className="font-bold">Map Error</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`map-container ${className}`}>
      <div ref={mapContainer} className="mapbox-gl-map" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-600">Loading map...</div>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;