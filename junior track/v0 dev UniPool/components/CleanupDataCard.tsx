'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, RefreshCw } from 'lucide-react';

interface CleanupDataCardProps {
  onCleanup?: () => void;
  className?: string;
}

export default function CleanupDataCard({ onCleanup, className = '' }: CleanupDataCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCleanupStaleRides = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      // Import RideService dynamically
      const { RideService } = await import('@/services/RideService');
      const removedCount = RideService.cleanupStaleRides();
      
      setMessage(`Successfully cleaned up ${removedCount} stale or inaccessible rides.`);
      
      // Call the parent component's onCleanup callback if provided
      if (onCleanup) {
        onCleanup();
      }
    } catch (error: any) {
      console.error("Error cleaning up rides:", error);
      setMessage(`Error: ${error.message || 'Failed to clean up rides'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFullReset = async () => {
    if (!window.confirm('Are you sure you want to reset all data? This will remove all rides, bookings, and user data.')) {
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      // Use the API endpoint for a full reset
      const response = await fetch('/api/debug/reset-data');
      const data = await response.json();
      
      if (data.success) {
        setMessage('Successfully reset all data. Refreshing page...');
        
        // Refresh the page after a short delay so the user can see the success message
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage(`Failed to reset data: ${data.message}`);
      }
    } catch (error: any) {
      console.error("Error resetting data:", error);
      setMessage(`Error: ${error.message || 'Failed to reset data'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`bg-gray-50 ${className}`}>
      <CardContent className="p-4 space-y-4">
        <h3 className="font-medium">Data Management Tools</h3>
        
        {message && (
          <div className={`p-3 rounded text-sm ${message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
            {message}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            onClick={handleCleanupStaleRides}
            className="text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Clean Stale Rides
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            disabled={isLoading}
            onClick={handleFullReset}
            className="text-xs text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Reset All Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
