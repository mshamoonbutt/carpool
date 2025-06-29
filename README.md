# UniPool - Carpooling Application

UniPool is a comprehensive carpooling solution that connects drivers and riders. The application consists of a FastAPI backend and a Next.js frontend.

## Project Structure

```
carpool/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── models/        # Pydantic models and SQLAlchemy models
│   │   └── routes/        # API endpoints
│   ├── migrations/        # Alembic migrations
│   └── main.py            # Main application entry point
└── junior track/
    └── v0 dev UniPool/    # Next.js frontend
```

## Quick Start

For convenience, you can use the provided start script to run both the backend and frontend:

```bash
start-app.bat
```

This will start the backend server on port 8000 and the frontend on port 3000.

## Backend Setup (FastAPI)

### 1. Create a virtual environment and activate it

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
```

### 2. Install required packages

```bash
pip install -r requirements.txt
```

### 3. Initialize the database

```bash
python migrate.py  # Run database migrations
python seed_data.py  # Seed the database with initial data
```

### 4. Run the FastAPI server

```bash
python main.py
```

The FastAPI server will be available at `http://localhost:8000`. You can access the API documentation at `http://localhost:8000/docs`.

## Frontend Setup (Next.js)

### 1. Navigate to the frontend directory

```bash
cd "junior track/v0 dev UniPool"
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
```

### 3. Run the development server

```bash
npm run dev
# or
pnpm dev
```

The frontend will be available at `http://localhost:3000`.

## Backend and Frontend Integration

The frontend and backend have been fully integrated. The frontend uses the backend API for all operations:

1. User authentication (login/register)
2. Ride creation, search, and management
3. Booking creation and management

By default, the frontend will attempt to connect to the backend API at `http://localhost:8000/api`. This can be configured in the `.env.local` file in the frontend directory.

### Environment Configuration

The frontend configuration is stored in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_ALLOW_FALLBACK=false
```

- `NEXT_PUBLIC_API_URL`: The URL of the backend API
- `NEXT_PUBLIC_ALLOW_FALLBACK`: If set to `true`, the frontend will fall back to localStorage if the API is unavailable. Set to `false` to force API usage and show proper error messages when the API is down.

## Troubleshooting

- If you encounter database errors, try running the migration script again
- Make sure both backend and frontend are running simultaneously
- Check if the API URL in `.env.local` matches your backend server address
- Verify that no other applications are using the same ports (3000 for frontend, 8000 for backend)

### 1. Install dependencies

```bash
cd "junior track/v0 dev UniPool"
npm install
```

### 2. Environment setup

The application uses a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Run the development server

```bash
npm run dev
```

The Next.js frontend will be available at `http://localhost:3000`.

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get access token
- `GET /api/users/me` - Get current user profile

### Rides

- `POST /api/rides` - Create a new ride
- `GET /api/rides` - Get all rides
- `GET /api/rides/search` - Search for rides with filters
- `GET /api/rides/{ride_id}` - Get a specific ride
- `PUT /api/rides/{ride_id}` - Update a ride
- `DELETE /api/rides/{ride_id}` - Delete a ride (sets status to cancelled)

### Bookings

- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get my bookings as a passenger
- `GET /api/bookings/as-driver` - Get bookings for my rides as a driver
- `GET /api/bookings/{booking_id}` - Get a specific booking
- `PUT /api/bookings/{booking_id}` - Update a booking status

## Testing Credentials

Use these test users for login:

- Driver: john.driver@example.com / password123
- Rider: sarah.rider@example.com / password123
- Both roles: mike.both@example.com / password123
