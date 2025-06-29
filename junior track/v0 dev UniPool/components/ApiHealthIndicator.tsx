"use client";

import React, { useEffect, useState } from 'react';
import { checkApiHealth, apiConfig } from '@/utils/apiConfig';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { CircleCheck, CircleAlert } from 'lucide-react';

export const ApiHealthIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  
  // Check API health on mount and periodically
  useEffect(() => {
    const checkHealth = async () => {
      const online = await checkApiHealth();
      setIsOnline(online);
    };
    
    // Initial check
    checkHealth();
    
    // Set up polling every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (isOnline === null) {
    return null; // Don't show anything while checking
  }
  
  return (
    <div className="inline-flex items-center gap-1">
      <Badge 
        variant={isOnline ? "success" : "destructive"}
        className={`text-xs ${isOnline ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
      >
        {isOnline ? (
          <><CircleCheck className="h-3 w-3 mr-1" /> API Online</>
        ) : (
          <><CircleAlert className="h-3 w-3 mr-1" /> Offline Mode</>
        )}
      </Badge>
    </div>
  );
};

export default ApiHealthIndicator;
