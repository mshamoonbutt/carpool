// app/rides/search/page.js
'use client';

import RideList from '@/components/RideList';

export default function SearchRidesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find a Ride</h1>
          <p className="text-gray-600">Search for rides that match your schedule and location</p>
        </div>
        
        {/* Enhanced RideList with search form and real-time updates */}
        <RideList 
          showSearchForm={true}
          onFiltersChange={(filters) => console.log('Filters changed:', filters)}
        />
      </div>
    </div>
  );
}