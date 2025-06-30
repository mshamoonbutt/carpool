// app/rides/search/page.js
'use client';

import RideList from '@/components/RideList';

export default function SearchRidesPage() {

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <button 
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold text-foreground mb-2">Find a Ride</h1>
          <p className="text-muted-foreground">Search for rides that match your schedule and location</p>
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