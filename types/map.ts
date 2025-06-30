// Map-related TypeScript types

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapMarker {
  coordinates: [number, number]; // [lng, lat] for Mapbox
  title: string;
  color?: string;
  description?: string;
}

export interface Route {
  origin: string;
  destination: string;
  coordinates: [number, number][];
  originCoords: [number, number];
  destCoords: [number, number];
  distance?: number;
  duration?: number;
}

export interface LocationSuggestion {
  name: string;
  coordinates: [number, number];
  type: string;
  relevance?: number;
  isFallback?: boolean;
}

export interface MapView {
  lng: number;
  lat: number;
  zoom: number;
}

export interface CurrentLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

export interface DriverLocation {
  lat: number;
  lng: number;
  timestamp?: number;
}

export interface MapboxMapProps {
  initialView?: MapView;
  markers?: MapMarker[];
  route?: Route | null;
  currentLocation?: CurrentLocation | null;
  driverLocation?: DriverLocation | null;
  onMapLoad?: (map: any) => void;
  interactive?: boolean;
  className?: string;
}

export interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: LocationSuggestion) => void;
  placeholder?: string;
  label?: string;
  suggestions: LocationSuggestion[];
  showSuggestions: boolean;
  isLoading?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
}

export interface MapServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface GeocodingResult {
  coordinates: [number, number];
  address: string;
  type: string;
  relevance: number;
  isFallback?: boolean;
}

export interface DirectionsResult {
  coordinates: [number, number][];
  distance: number; // km
  duration: number; // minutes
  steps?: any[];
  congestion?: number[];
}

export interface PredefinedLocation {
  name: string;
  coordinates: [number, number];
  type: string;
  address: string;
}

export interface MapEvents {
  LOCATION_UPDATED: string;
  ROUTE_CALCULATED: string;
  ADDRESS_SELECTED: string;
  TRACKING_STARTED: string;
  TRACKING_STOPPED: string;
}

export interface MapErrors {
  GEOLOCATION_DENIED: string;
  GEOLOCATION_UNAVAILABLE: string;
  GEOLOCATION_TIMEOUT: string;
  GEOCODING_FAILED: string;
  ROUTING_FAILED: string;
  OPTIMIZATION_FAILED: string;
}
