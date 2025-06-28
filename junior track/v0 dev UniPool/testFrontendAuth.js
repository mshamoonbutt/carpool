// testFrontendAuth.js - Test frontend authentication with the backend API

const axios = require('axios');

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function testFrontendAuth() {
  console.log('Testing frontend authentication with backend API...');
  console.log('API URL:', API_URL);
  
  try {
    // Test server connection
    console.log('\n1. Testing server connection...');
    try {
      const response = await axios.get('http://localhost:8000/');
      console.log('✅ Server is running:', response.data);
    } catch (error) {
      console.error('❌ Cannot connect to server. Error:', error.message);
      console.log('Make sure the backend server is running at http://localhost:8000/');
      return;
    }
    
    // Test login
    console.log('\n2. Testing login...');
    
    // Create form data for login (FastAPI expects form data)
    const formData = new FormData();
    formData.append('username', 'john.driver@example.com');
    formData.append('password', 'password123');
    
    try {
      const loginResponse = await axios.post(
        `${API_URL}/users/login`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('✅ Login successful!');
      console.log('Token:', loginResponse.data.access_token.substring(0, 20) + '...');
      
      // Test getting user profile with token
      const token = loginResponse.data.access_token;
      
      console.log('\n3. Getting user profile...');
      const profileResponse = await axios.get(
        `${API_URL}/users/me`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('✅ Got user profile:', profileResponse.data);
      
      return {
        success: true,
        token,
        user: profileResponse.data
      };
      
    } catch (error) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      console.log('Status:', error.response?.status);
      console.log('Response:', error.response?.data);
      
      // Try with different Content-Type
      console.log('\nTrying with application/x-www-form-urlencoded...');
      
      try {
        const params = new URLSearchParams();
        params.append('username', 'john.driver@example.com');
        params.append('password', 'password123');
        
        const altResponse = await axios.post(
          `${API_URL}/users/login`,
          params,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        
        console.log('✅ Login successful with urlencoded!');
        console.log('Token:', altResponse.data.access_token.substring(0, 20) + '...');
        
        return {
          success: true,
          token: altResponse.data.access_token
        };
      } catch (altError) {
        console.error('❌ Login also failed with urlencoded:', altError.response?.data || altError.message);
        return { success: false };
      }
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    return { success: false };
  }
}

// Run the test
testFrontendAuth().then(result => {
  console.log('\n--- Test Results ---');
  console.log('Authentication successful:', result.success);
  if (result.user) {
    console.log('User:', result.user.name, `(${result.user.email})`);
  }
  console.log('------------------------');
});
