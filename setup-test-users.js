// Setup test users for carpooling system
// Run this in browser console or add to your app initialization

const setupTestUsers = () => {
  // Clear existing data
  localStorage.removeItem('users');
  localStorage.removeItem('carpool_rides');
  
  // Create test users
  const testUsers = [
    {
      id: 'student1',
      name: 'Student1',
      email: 'student1@fccu.edu.pk',
      password: 'password123',
      type: 'student',
      ratings: {
        rider: { average: 4.8, count: 15 },
        driver: { average: 4.9, count: 8 }
      }
    },
    {
      id: 'student2', 
      name: 'Student2',
      email: 'student2@fccu.edu.pk',
      password: 'password123',
      type: 'student',
      ratings: {
        rider: { average: 4.7, count: 12 },
        driver: { average: 4.8, count: 10 }
      }
    }
  ];
  
  // Save users to localStorage
  localStorage.setItem('users', JSON.stringify(testUsers));
  
  console.log('✅ Test users created:');
  console.log('Student1 - For finding rides');
  console.log('Student2 - For posting rides');
  console.log('');
  console.log('Login credentials:');
  console.log('Email: student1@fccu.edu.pk or student2@fccu.edu.pk');
  console.log('Password: password123');
  
  return testUsers;
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setupTestUsers };
} else {
  // Make available globally for browser console
  window.setupTestUsers = setupTestUsers;
}

// Auto-run if this file is executed directly
if (typeof window !== 'undefined') {
  setupTestUsers();
} 