// testConnection.js - A simple utility to test the connection between frontend and backend

const axios = require('axios');

const API_URL = 'http://localhost:8000/api';

// Test 1: Check if backend is running by accessing the root endpoint
async function testBackendConnection() {
  try {
    const response = await axios.get('http://localhost:8000/');
    console.log('✅ Backend is running:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    return false;
  }
}

// Test 2: Try logging in with test credentials
async function testLogin() {
  try {
    const formData = new FormData();
    formData.append('username', 'john.driver@example.com');
    formData.append('password', 'password123');

    const response = await axios.post(`${API_URL}/users/login`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Login successful, token received');
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

// Test 3: Get user profile with token
async function testGetUserProfile(token) {
  if (!token) {
    console.error('❌ Cannot test user profile without token');
    return false;
  }
  
  try {
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    console.log('✅ User profile retrieved successfully:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Getting user profile failed:', error.response?.data || error.message);
    return false;
  }
}

// Test 4: Get available rides
async function testGetRides() {
  try {
    const response = await axios.get(`${API_URL}/rides`);
    console.log('✅ Rides retrieved successfully:', response.data.length, 'rides found');
    return true;
  } catch (error) {
    console.error('❌ Getting rides failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🔍 Testing connection to backend...');
  
  const backendRunning = await testBackendConnection();
  if (!backendRunning) {
    console.error('❌ Backend is not running. Please start the backend server first.');
    return;
  }
  
  const token = await testLogin();
  await testGetUserProfile(token);
  await testGetRides();
  
  console.log('\n🔍 Summary:');
  console.log('Backend URL:', API_URL);
  console.log('Frontend can connect to backend:', backendRunning ? '✅ Yes' : '❌ No');
  console.log('Authentication works:', token ? '✅ Yes' : '❌ No');
}

// Run the tests
runAllTests();
