import { useState, useEffect, useRef } from 'react';
import MapService from '../../services/MapService';
import './LocationSearch.css';

// Lazy load MapService to avoid instantiation on import
let mapService = null;
const getMapService = () => {
  if (!mapService) {
    mapService = new MapService();
  }
  return mapService;
};

const LocationSearch = ({ 
  onSelect, 
  placeholder = "Search for location...",
  className = "",
  showCurrentLocation = true,
  value = "",
  disabled = false
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 2) {
      setIsLoading(true);
      try {
        const results = await getMapService().getAddressSuggestions(value);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelect = (suggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    onSelect({
      name: suggestion.name,
      coordinates: suggestion.coordinates,
      address: suggestion.address
    });
  };

  const handleCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const location = await getMapService().getCurrentLocation();
      const address = await getMapService().reverseGeocode(location.lng, location.lat);
      
      setQuery(address.name || 'Current Location');
      onSelect({
        name: 'Current Location',
        coordinates: [location.lng, location.lat],
        address: address.name
      });
    } catch (error) {
      console.error('Location error:', error);
      alert('Could not get current location');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`location-search ${className}`}>
      <div className="search-input-container">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          disabled={disabled}
          className="search-input"
        />
        
        {isLoading && (
          <div className="search-loading">
            <div className="spinner"></div>
          </div>
        )}
        
        {showCurrentLocation && (
          <button
            onClick={handleCurrentLocation}
            disabled={disabled}
            className="current-location-button"
            title="Use current location"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
            </svg>
          </button>
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((item, index) => (
            <li 
              key={index}
              onClick={() => handleSelect(item)}
              className="suggestion-item"
            >
              <div className="suggestion-main">
                <strong>{item.name.split(',')[0]}</strong>
                <span className="suggestion-type">{item.type}</span>
              </div>
              <div className="suggestion-address">{item.address}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearch;
