const DB_KEY = 'unipool_db';

class DataService {
  constructor() {
    this.initializeDB();
  }

  initializeDB() {
    console.log('🔧 DataService: Initializing database...');
    
    // Check if DB already exists (from App.jsx test users)
    if (!localStorage.getItem(DB_KEY)) {
      console.log('🔧 DataService: No existing DB, creating default structure...');
      
      // Try to load from db.json, but don't fail if it doesn't exist
      fetch('/db.json')
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('db.json not found');
        })
        .then(data => {
          console.log('🔧 DataService: Loaded data from db.json');
          localStorage.setItem(DB_KEY, JSON.stringify(data));
        })
        .catch(error => {
          console.log('🔧 DataService: Using default empty DB structure');
          // Initialize empty DB if file fails to load
          localStorage.setItem(DB_KEY, JSON.stringify({
            users: [],
            rides: [],
            bookings: []
          }));
        });
    } else {
      console.log('🔧 DataService: Existing DB found');
    }
  }

  getDB() {
    return JSON.parse(localStorage.getItem(DB_KEY)) || {
      users: [],
      rides: [],
      bookings: []
    };
  }

  saveDB(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }

  // User Methods
  getUsers() {
    return this.getDB().users;
  }

  getUserById(id) {
    return this.getDB().users.find(user => user.id === id);
  }

  getUserByEmail(email) {
    // First check the main users list (from App.jsx test users)
    const mainUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const mainUser = mainUsers.find(user => user.email === email);
    if (mainUser) {
      console.log('🔧 DataService: Found user in main users list:', mainUser.name);
      return mainUser;
    }
    
    // Then check the DB users
    const dbUser = this.getDB().users.find(user => user.email === email);
    if (dbUser) {
      console.log('🔧 DataService: Found user in DB:', dbUser.name);
      return dbUser;
    }
    
    console.log('🔧 DataService: User not found:', email);
    return null;
  }

  addUser(user) {
    const db = this.getDB();
    db.users.push(user);
    this.saveDB(db);
    return user;
  }

  // Ride Methods
  getRides() {
    return this.getDB().rides;
  }

  addRide(ride) {
    const db = this.getDB();
    db.rides.push(ride);
    this.saveDB(db);
    return ride;
  }

  // Booking Methods
  getBookings() {
    return this.getDB().bookings;
  }

  addBooking(booking) {
    const db = this.getDB();
    db.bookings.push(booking);
    this.saveDB(db);
    return booking;
  }
}

export default new DataService();