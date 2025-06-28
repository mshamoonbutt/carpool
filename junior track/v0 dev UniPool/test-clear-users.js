"use client";

// A simple script to test clearing all users from the database
console.log("Testing user database clearing...");

// Import the AuthService
import { AuthService } from "./services/AuthService.js";

// Check current users
async function testClearUsers() {
  try {
    // Initialize the database if not already
    await AuthService.initializeDatabase();
    
    // Display current stats
    console.log("Before clearing users:");
    const beforeStats = AuthService.getDatabaseStats();
    console.log(`Users: ${beforeStats.users}, Rides: ${beforeStats.rides}, Bookings: ${beforeStats.bookings}`);
    
    // Clear all users
    console.log("Clearing all users...");
    await AuthService.clearAllUsers();
    
    // Display stats after clearing
    console.log("After clearing users:");
    const afterStats = AuthService.getDatabaseStats();
    console.log(`Users: ${afterStats.users}, Rides: ${afterStats.rides}, Bookings: ${afterStats.bookings}`);
    
    // Show success message
    console.log("✅ User database cleared successfully!");
  } catch (error) {
    console.error("❌ Failed to clear users:", error);
  }
}

// Run the test
testClearUsers();
