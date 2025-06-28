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
  onMapLoad,
  interactive = true,
  className = ''
}) => {
  const mapContainer = useRef(null);
  const [map, setMap] = useState(null);
  const [mapMarkers, setMapMarkers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize map
  useEffect(() => {
    console.log('MapboxMap: Component mounted');
    console.log('MapboxMap: Access token:', mapboxgl.accessToken);
    
    if (!mapContainer.current) {
      console.error('MapboxMap: No container ref');
      setError('No container element found');
      return;
    }

    // Check if container has dimensions
    const rect = mapContainer.current.getBoundingClientRect();
    console.log('MapboxMap: Container rect:', rect);
    
    if (rect.width === 0 || rect.height === 0) {
      console.error('MapboxMap: Container has no dimensions');
      setError('Container has no dimensions');
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
      newMap.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

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

      // Handle map render
      newMap.on('render', () => {
        console.log('MapboxMap: Map rendering');
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

  // Update markers when changed
  useEffect(() => {
    if (!map) return;

    console.log('MapboxMap: Updating markers:', markers);

    // Clear existing markers
    mapMarkers.forEach(marker => marker.remove());
    const newMarkers = [];

    // Add new markers
    markers.forEach(marker => {
      if (!marker.position) return;

      const popup = marker.content 
        ? new mapboxgl.Popup().setHTML(marker.content)
        : undefined;

      const newMarker = new mapboxgl.Marker({
        color: marker.color || '#3b82f6'
      })
        .setLngLat(marker.position)
        .setPopup(popup)
        .addTo(map);

      if (marker.autoOpenPopup) {
        newMarker.togglePopup();
      }

      newMarkers.push(newMarker);
    });

    setMapMarkers(newMarkers);
  }, [map, markers]);

  // Handle route display
  useEffect(() => {
    if (!map || !route) return;

    console.log('MapboxMap: Displaying route:', route);

    // Remove existing route layer if any
    if (map.getSource('route')) {
      map.removeLayer('route-layer');
      map.removeSource('route');
    }

    // Add route line
    map.addSource('route', {
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

    map.addLayer({
      id: 'route-layer',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4,
        'line-opacity': 0.8
      }
    });

    // Add origin and destination markers if coordinates are provided
    if (route.originCoords && route.destCoords) {
      // Origin marker (green)
      const originMarker = new mapboxgl.Marker({
        color: '#10b981'
      })
        .setLngLat(route.originCoords)
        .setPopup(new mapboxgl.Popup().setHTML(`<div class="text-green-600 font-medium">Origin</div><div class="text-sm">${route.origin}</div>`))
        .addTo(map);

      // Destination marker (red)
      const destMarker = new mapboxgl.Marker({
        color: '#ef4444'
      })
        .setLngLat(route.destCoords)
        .setPopup(new mapboxgl.Popup().setHTML(`<div class="text-red-600 font-medium">Destination</div><div class="text-sm">${route.destination}</div>`))
        .addTo(map);

      // Add to markers array for cleanup
      setMapMarkers(prev => [...prev, originMarker, destMarker]);
    }

    // Fit map to route bounds
    const bounds = new mapboxgl.LngLatBounds();
    route.coordinates.forEach(coord => bounds.extend(coord));
    map.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    });

  }, [map, route]);

  if (error) {
    return (
      <div className={`map-container ${className}`}>
        <div className="flex items-center justify-center h-full bg-red-100 text-red-800 p-4">
          <div>
            <h3 className="font-bold">Map Error</h3>
            <p>{error}</p>
            <p className="text-sm mt-2">Token: {mapboxgl.accessToken.substring(0, 20)}...</p>
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
      {!loading && !map && (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-100">
          <div className="text-yellow-800">Map not loaded</div>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;