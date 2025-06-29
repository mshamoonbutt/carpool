/**
 * Database Configuration
 * PostgreSQL connection setup with connection pooling
 */

const { Pool } = require('pg');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'unipool',
  user: process.env.DB_USER || 'unipool_user',
  password: process.env.DB_PASSWORD || 'secure_password',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test database connection
pool.on('connect', (client) => {
  console.log('🔗 Database client connected');
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('🔌 Database pool has ended');
    process.exit(0);
  });
});

/**
 * Execute a query with parameters
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
};

/**
 * Get a client from the pool
 */
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('⚠️ A client has been checked out for more than 5 seconds!');
    console.error(`The last executed query on this client was: ${client.lastQuery}`);
  }, 5000);
  
  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return query(...args);
  };
  
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release();
  };
  
  return client;
};

/**
 * Execute a transaction
 */
const transaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

/**
 * Initialize database tables
 */
const initializeTables = async () => {
  try {
    console.log('🔧 Initializing database tables...');
    
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('driver', 'rider', 'both') NOT NULL,
        university VARCHAR(100) NOT NULL,
        profile JSONB,
        preferences JSONB,
        driver_rating DECIMAL(3,2) DEFAULT 0.00,
        rider_rating DECIMAL(3,2) DEFAULT 0.00,
        driver_total_rides INTEGER DEFAULT 0,
        rider_total_rides INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        flag_reason VARCHAR(100),
        flag_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Rides table
    await query(`
      CREATE TABLE IF NOT EXISTS rides (
        id VARCHAR(50) PRIMARY KEY,
        driver_id VARCHAR(50) REFERENCES users(id),
        pickup JSONB NOT NULL,
        destination JSONB NOT NULL,
        departure_time TIMESTAMP NOT NULL,
        seats INTEGER NOT NULL,
        available_seats INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
        university VARCHAR(100) NOT NULL,
        route JSONB,
        recurring JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bookings table
    await query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(50) PRIMARY KEY,
        ride_id VARCHAR(50) REFERENCES rides(id),
        rider_id VARCHAR(50) REFERENCES users(id),
        pickup_point VARCHAR(255) NOT NULL,
        seats_requested INTEGER NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
        booking_code VARCHAR(20) UNIQUE NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        cancelled_at TIMESTAMP,
        cancellation_reason VARCHAR(200),
        refund_amount DECIMAL(10,2) DEFAULT 0.00,
        penalty_applied DECIMAL(10,2) DEFAULT 0.00
      )
    `);

    // Ratings table
    await query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id VARCHAR(50) PRIMARY KEY,
        ride_id VARCHAR(50) REFERENCES rides(id),
        rated_user_id VARCHAR(50) REFERENCES users(id),
        rater_user_id VARCHAR(50) REFERENCES users(id),
        role_type ENUM('driver', 'rider') NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
        review TEXT,
        is_automatic BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(50) PRIMARY KEY,
        user_id VARCHAR(50) REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        data JSONB,
        status ENUM('sent', 'delivered', 'read', 'acknowledged', 'failed') DEFAULT 'sent',
        delivery_results JSONB,
        read_at TIMESTAMP,
        acknowledged_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP
      )
    `);

    // Safety incidents table
    await query(`
      CREATE TABLE IF NOT EXISTS safety_incidents (
        id VARCHAR(50) PRIMARY KEY,
        booking_id VARCHAR(50) REFERENCES bookings(id),
        user_id VARCHAR(50) REFERENCES users(id),
        role_type ENUM('driver', 'rider') NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database tables:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  getClient,
  transaction,
  testConnection,
  initializeTables
}; 