# UniPool Backend

Complete backend server for the UniPool campus ride-sharing platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- Redis (optional, for caching)

### Installation

1. **Clone and navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp env.example .env
# Edit .env with your configuration
```

4. **Set up PostgreSQL database**
```bash
# Create database and user
createdb unipool
createuser unipool_user
psql -d unipool -c "ALTER USER unipool_user WITH PASSWORD 'secure_password';"
```

5. **Initialize database tables**
```bash
npm run migrate
```

6. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Project Structure

```
backend/
├── config/                 # Configuration files
│   ├── database.js        # PostgreSQL connection
│   └── mapbox.js          # Mapbox API config
├── middleware/            # Express middleware
│   ├── auth.js           # JWT authentication
│   ├── validation.js     # Input validation
│   └── errorHandler.js   # Error handling
├── repositories/         # Data access layer
│   ├── UserRepository.js
│   ├── RideRepository.js
│   ├── BookingRepository.js
│   └── RatingRepository.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── rideRoutes.js
│   ├── bookingRoutes.js
│   ├── ratingRoutes.js
│   └── notificationRoutes.js
├── services/            # Business logic
│   ├── BookingService.js
│   ├── MatchingService.js
│   ├── NotificationService.js
│   ├── RatingService.js
│   └── SafetyService.js
├── websocket/          # Real-time communication
│   └── WebSocketServer.js
├── tests/             # Test files
├── server.js          # Main server file
├── package.json       # Dependencies
└── env.example        # Environment template
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=unipool
DB_USER=unipool_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# External APIs
MAPBOX_ACCESS_TOKEN=your_mapbox_token
OPENAI_API_KEY=your_openai_key

# Email/SMS (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
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
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Rides Table
```sql
CREATE TABLE rides (
  id VARCHAR(50) PRIMARY KEY,
  driver_id VARCHAR(50) REFERENCES users(id),
  pickup JSONB NOT NULL,
  destination JSONB NOT NULL,
  departure_time TIMESTAMP NOT NULL,
  seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
  route JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id VARCHAR(50) PRIMARY KEY,
  ride_id VARCHAR(50) REFERENCES rides(id),
  rider_id VARCHAR(50) REFERENCES users(id),
  pickup_point VARCHAR(255) NOT NULL,
  seats_requested INTEGER NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  booking_code VARCHAR(20) UNIQUE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/:id` - Get user by ID

### Rides
- `POST /api/rides` - Create new ride
- `GET /api/rides` - Search rides
- `GET /api/rides/:id` - Get ride details
- `PUT /api/rides/:id` - Update ride
- `DELETE /api/rides/:id` - Cancel ride

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user` - Get user bookings
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `GET /api/bookings/availability/:rideId` - Check availability

### Ratings
- `POST /api/ratings` - Submit rating
- `GET /api/ratings/user/:userId` - Get user ratings
- `GET /api/ratings/ride/:rideId` - Get ride ratings

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `GET /api/notifications/unread-count` - Get unread count

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🌐 WebSocket

Real-time notifications are available via WebSocket connection:

```javascript
const ws = new WebSocket('ws://localhost:3001');

// Authenticate
ws.send(JSON.stringify({
  type: 'authentication',
  token: 'your_jwt_token'
}));

// Subscribe to notifications
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'notifications'
}));

// Listen for messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

## 🧪 Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📊 Monitoring

### Health Check
- `GET /health` - Server health status

### Logging
Logs are written to console and optionally to files. Configure in `.env`:
```env
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t unipool-backend .

# Run container
docker run -p 3001:3001 unipool-backend
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DB_HOST=postgres
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: unipool
      POSTGRES_USER: unipool_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

## 🔧 Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm run lint` - Run ESLint
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with test data

### Code Style
The project uses ESLint with Airbnb configuration. Run `npm run lint` to check code style.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🔄 Integration with Frontend

The backend is designed to work seamlessly with the React frontend. The frontend services in `src/services/` are already configured to call these backend endpoints.

To integrate:

1. Update frontend environment variables to point to backend
2. Ensure CORS is properly configured
3. Test authentication flow
4. Verify WebSocket connections

The backend provides all the functionality needed for the UniPool platform including user management, ride booking, real-time notifications, and safety features. 