import { useState } from 'react';
import DataService from '../../services/DataService';

/**
 * DatabaseReset - A simple component to reset the database for testing
 */
const DatabaseReset = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleResetClick = () => {
    setShowConfirm(true);
  };
  
  const handleCancel = () => {
    setShowConfirm(false);
  };
  
  const handleConfirm = async () => {
    try {
      setIsResetting(true);
      
      // Reset the database
      DataService.resetDatabase();
      
      // Reload initial data
      const response = await fetch('/db.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch db.json: ${response.status}`);
      }
      
      const data = await response.json();
      localStorage.setItem('unipool_db', JSON.stringify(data));
      
      alert('Database reset successful');
      
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error resetting database:', error);
      alert(`Error resetting database: ${error.message}`);
    } finally {
      setIsResetting(false);
      setShowConfirm(false);
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!showConfirm ? (
        <button
          onClick={handleResetClick}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm shadow-md"
        >
          Reset Database
        </button>
      ) : (
        <div className="bg-white p-4 rounded-md shadow-lg border border-gray-200">
          <p className="text-gray-700 mb-3 font-medium">
            Are you sure you want to reset the database?
          </p>
          <p className="text-gray-500 text-sm mb-4">
            This will delete all current data and reload the initial sample data.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm"
              disabled={isResetting}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              disabled={isResetting}
            >
              {isResetting ? 'Resetting...' : 'Confirm Reset'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseReset;
