import { useState, useEffect } from 'react';

/**
 * LocationPicker - A component for selecting locations
 * Allows selecting from popular areas or entering a custom location
 */
const LocationPicker = ({ value, onChange, label }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  
  // Popular areas in Lahore
  const POPULAR_AREAS = [
    'DHA Phase 1',
    'DHA Phase 2',
    'DHA Phase 3',
    'DHA Phase 4',
    'DHA Phase 5',
    'DHA Phase 6',
    'DHA Phase 7',
    'DHA Phase 8',
    'Gulberg',
    'Gulberg II',
    'Gulberg III',
    'Model Town',
    'Johar Town',
    'Faisal Town',
    'Garden Town',
    'Bahria Town',
    'Valencia',
    'Wapda Town',
    'Cantt',
    'Askari',
    'FCC (Forman Christian College)',
    'LUMS',
    'UET',
    'GCU',
    'Punjab University'
  ];
  
  // Set initial values
  useEffect(() => {
    if (value) {
      if (POPULAR_AREAS.includes(value)) {
        setSelectedOption(value);
        setUseCustom(false);
      } else {
        setCustomLocation(value);
        setUseCustom(true);
      }
    }
  }, [value]);
  
  // Handle selection from dropdown
  const handleDropdownChange = (e) => {
    const newValue = e.target.value;
    setSelectedOption(newValue);
    setUseCustom(false);
    onChange(newValue);
  };
  
  // Handle custom location input
  const handleCustomChange = (e) => {
    const newValue = e.target.value;
    setCustomLocation(newValue);
    setUseCustom(true);
    onChange(newValue);
  };
  
  // Toggle between dropdown and custom input
  const toggleCustom = () => {
    setUseCustom(!useCustom);
    onChange(useCustom ? selectedOption : customLocation);
  };
  
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      {/* Location selection method toggle */}
      <div className="flex space-x-4 mb-2">
        <button
          type="button"
          onClick={() => setUseCustom(false)}
          className={`text-xs py-1 px-2 rounded ${
            !useCustom 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Choose from list
        </button>
        <button
          type="button"
          onClick={() => setUseCustom(true)}
          className={`text-xs py-1 px-2 rounded ${
            useCustom 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Enter location
        </button>
      </div>
      
      {/* Location selector */}
      {!useCustom ? (
        <select
          value={selectedOption}
          onChange={handleDropdownChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        >
          <option value="">Select a location</option>
          {POPULAR_AREAS.map(area => (
            <option key={area} value={area}>
              {area}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={customLocation}
          onChange={handleCustomChange}
          placeholder="Enter location (e.g., DHA Phase 5, Block A)"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      )}
    </div>
  );
};

export default LocationPicker;
