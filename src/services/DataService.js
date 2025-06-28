const DB_KEY = 'unipool_db';

class DataService {
  constructor() {
    this.initializeDB();
  }

  initializeDB() {
    // Check if DB already exists (from App.jsx test users)
    if (!localStorage.getItem(DB_KEY)) {
      // Try to load from db.json, but don't fail if it doesn't exist
      fetch('/db.json')
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('db.json not found');
        })
        .then(data => {
          localStorage.setItem(DB_KEY, JSON.stringify(data));
        })
        .catch(error => {
          console.log('Using default empty DB structure');
          // Initialize empty DB if file fails to load
          localStorage.setItem(DB_KEY, JSON.stringify({
            users: [],
            rides: [],
            bookings: []
          }));
        });
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
    return this.getDB().users.find(user => user.email === email);
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