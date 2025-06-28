"use client";

import { AuthService } from "./services/AuthService";

/**
 * This script clears all users from the database
 */
async function clearAllUsers() {
  try {
    // Initialize database first (in case it doesn't exist yet)
    await AuthService.initializeDatabase();
    
    // Get current stats before deletion
    const statsBefore = AuthService.getDatabaseStats();
    console.log("Database stats before clearing users:", statsBefore);
    
    // Clear all users
    await AuthService.clearAllUsers();
    
    // Get stats after deletion
    const statsAfter = AuthService.getDatabaseStats();
    console.log("Database stats after clearing users:", statsAfter);
    
    console.log("✅ Successfully cleared all users from the database");
  } catch (error) {
    console.error("❌ Error clearing users:", error);
  }
}

// Execute the function when the script runs
clearAllUsers();

console.log("Run this script to clear all users from the database");
console.log("After running, check the console for results");
