// Test utility for locations
import { lahoreLocations, searchLocations } from '../data/locations.js';

export const testAllLocations = () => {
  console.log('🧪 Testing all locations...');
  
  // Test 1: Check if all locations are loaded
  console.log('📊 Total locations loaded:', Object.keys(lahoreLocations).length);
  console.log('📍 All location names:', Object.keys(lahoreLocations));
  
  // Test 2: Check specific locations with new coordinates
  const testLocations = [
    'Allama Iqbal Town',
    'FCC University',
    'DHA Phase 1',
    'Model Town',
    'Gulberg III',
    'Bahria Town Lahore',
    'Lake City',
    'Valencia Town',
    'Johar Town',
    'Lahore Cantonment'
  ];
  
  testLocations.forEach(location => {
    const found = lahoreLocations[location];
    if (found) {
      console.log(`✅ ${location}: [${found.coordinates[0]}, ${found.coordinates[1]}]`);
    } else {
      console.log(`❌ ${location}: NOT FOUND`);
    }
  });
  
  // Test 3: Test search function
  console.log('\n🔍 Testing search function...');
  const searchTests = [
    'allama',
    'iqbal',
    'fcc',
    'dha',
    'model',
    'gulberg',
    'bahria',
    'lake',
    'valencia'
  ];
  
  searchTests.forEach(term => {
    const results = searchLocations(term);
    console.log(`Search "${term}":`, results.length, 'results');
    results.slice(0, 3).forEach(result => {
      console.log(`  - ${result.name} (${result.category})`);
    });
  });
  
  // Test 4: Check coordinates format and accuracy
  console.log('\n🎯 Checking coordinates format and accuracy...');
  let validCoordinates = 0;
  let totalLocations = 0;
  
  Object.entries(lahoreLocations).forEach(([key, location]) => {
    totalLocations++;
    if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      console.log(`❌ ${key}: Invalid coordinates format`);
    } else {
      const [lng, lat] = location.coordinates;
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        console.log(`❌ ${key}: Coordinates not numbers`);
      } else {
        // Check if coordinates are in reasonable range for Lahore
        if (lng >= 74.0 && lng <= 75.0 && lat >= 31.0 && lat <= 32.0) {
          validCoordinates++;
        } else {
          console.log(`⚠️ ${key}: Coordinates outside Lahore range [${lng}, ${lat}]`);
        }
      }
    }
  });
  
  console.log(`\n📈 Coordinate accuracy: ${validCoordinates}/${totalLocations} locations have valid coordinates`);
  
  // Test 5: Test route calculation with new coordinates
  console.log('\n🚗 Testing route calculation with new coordinates...');
  const testRoutes = [
    ['FCC University', 'Model Town'],
    ['DHA Phase 1', 'Gulberg III'],
    ['Allama Iqbal Town', 'Lahore Cantonment'],
    ['Bahria Town Lahore', 'Lake City']
  ];
  
  testRoutes.forEach(([origin, destination]) => {
    const originLoc = lahoreLocations[origin];
    const destLoc = lahoreLocations[destination];
    
    if (originLoc && destLoc) {
      const distance = calculateDistance(
        originLoc.coordinates[1], originLoc.coordinates[0],
        destLoc.coordinates[1], destLoc.coordinates[0]
      );
      console.log(`📍 ${origin} → ${destination}: ${distance.toFixed(1)} km`);
    } else {
      console.log(`❌ Route test failed: ${origin} → ${destination}`);
    }
  });
  
  console.log('\n✅ Location testing complete!');
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Export for browser console
window.testAllLocations = testAllLocations; 