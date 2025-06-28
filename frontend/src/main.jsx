import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import DataService from './services/DataService'

// Load initial data from db.json if needed
const initializeApp = async () => {
  try {
    // Check if data already exists in localStorage
    if (!localStorage.getItem('unipool_db')) {
      console.log('Loading initial data from db.json...');
      const response = await fetch('/db.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch db.json: ${response.status}`);
      }
      const data = await response.json();
      
      // Save to localStorage
      localStorage.setItem('unipool_db', JSON.stringify(data));
      console.log('Initial data loaded successfully');
    } else {
      console.log('Using existing data from localStorage');
    }

    // Render the app
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error('Error initializing app:', error);
    // Render the app anyway, but with empty data
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
};

// Initialize the app
initializeApp();
