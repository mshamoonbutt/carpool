const DB_KEY = 'unipool_db';

class DataService {
  constructor() {
    this.initializeDB();
  }

  initializeDB() {
    if (!localStorage.getItem(DB_KEY)) {
      fetch('/db.json')
        .then(response => response.json())
        .then(data => {
          localStorage.setItem(DB_KEY, JSON.stringify(data));
        })
        .catch(error => {
          console.error('Failed to load initial data:', error);
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

  // Ride Methods (stubs for now)
  getRides() {
    return this.getDB().rides;
  }

  // ... More methods will be added as needed
}

export default new DataService();