import { useState, useEffect } from 'react';
import DataService from '../../services/DataService';

/**
 * UserSwitcher - A component to switch between users for testing
 * This is only used for the Junior track simulation
 */
const UserSwitcher = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  useEffect(() => {
    // Load users from database
    const data = DataService.getData();
    setUsers(data.users || []);
    
    // Check localStorage for previously selected user
    const savedUser = DataService.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);
  
  const switchUser = (user) => {
    // Save to localStorage
    DataService.setCurrentUser(user);
    
    // Update state
    setCurrentUser(user);
    setShowDropdown(false);
    
    // Reload page to reflect changes
    window.location.reload();
  };
  
  const logout = () => {
    // Clear current user
    localStorage.removeItem('unipool_current_user');
    setCurrentUser(null);
    setShowDropdown(false);
    
    // Reload page to reflect changes
    window.location.reload();
  };
  
  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-primary text-white px-4 py-2 rounded-md text-sm shadow-md flex items-center"
        >
          {currentUser ? (
            <span>
              {currentUser.name} ({currentUser.role})
              <i className="fas fa-chevron-down ml-2 text-xs"></i>
            </span>
          ) : (
            <span>
              Switch User
              <i className="fas fa-chevron-down ml-2 text-xs"></i>
            </span>
          )}
        </button>
        
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-lg border border-gray-200">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Switch User (Test Mode)</h3>
              <p className="text-xs text-gray-500 mt-1">
                For testing the multi-user functionality
              </p>
            </div>
            
            <ul className="max-h-60 overflow-y-auto">
              {users.map(user => (
                <li key={user.id} className="border-b border-gray-100 last:border-b-0">
                  <button
                    onClick={() => switchUser(user)}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                      currentUser?.id === user.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-gray-500">
                        {user.email} ({user.role})
                      </span>
                    </div>
                  </button>
                </li>
              ))}
              
              {currentUser && (
                <li className="border-t border-gray-200">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50"
                  >
                    <span className="text-sm">Logout</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSwitcher;
