# UniPool - Campus Ride Sharing Platform

A ride-sharing platform connecting student drivers with riders traveling from across Lahore to their universities. This project is built for Code Jam 2.0.

## Project Overview

UniPool intelligently recommends rides based on users' schedules and preferences, emphasizing simplicity, convenience, and safety. Think of it as "Uber meets Google Calendar", a platform that proactively matches rides and automates your daily commute from home to campus.

## Features

- User management with university email verification
- Ride posting, searching, and booking
- Rating system for drivers and riders
- AI-powered recommendations and route matching
- Multi-user simulation via browser tabs (using localStorage)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository

   ```
   git clone <repository-url>
   cd carpool/frontend
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Start the development server

   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
frontend/
├── public/              # Static files
│   ├── db.json          # Initial database for localStorage
│   └── vite.svg         # Favicon
├── src/                 # Source files
│   ├── assets/          # Assets (images, etc.)
│   ├── components/      # Reusable components
│   │   ├── common/      # Common components (headers, etc.)
│   │   ├── rides/       # Ride-related components
│   │   └── users/       # User-related components
│   ├── contracts/       # API contracts for team collaboration
│   ├── pages/           # Page components
│   ├── services/        # Services for data handling
│   │   ├── AIService.js         # AI-related functionality
│   │   ├── BookingService.js    # Booking operations
│   │   ├── DataService.js       # localStorage database handling
│   │   ├── RideService.js       # Ride operations
│   │   └── UserService.js       # User operations
│   ├── utils/           # Utility functions
│   ├── App.css          # App-specific styles
│   ├── App.jsx          # Main App component
│   ├── index.css        # Global styles
│   └── main.jsx         # Entry point
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation
```

## Junior Track Implementation

This implementation uses the browser's localStorage as a database to simulate multi-user functionality. Key points:

- Data is shared across browser tabs (localStorage)
- Multiple users can be simulated with the user switcher
- Database can be reset to initial state for testing

### Testing Multi-User Functionality

1. Open multiple browser tabs with the app
2. Use the "Switch User" button to select different users in each tab
3. Make changes in one tab and refresh the other tabs to see updates
4. Use the "Reset Database" button to restore initial data

## API Structure

The project follows a REST-like architecture with these key services:

- `UserService`: User management (registration, login, etc.)
- `RideService`: Ride operations (create, search, etc.)
- `BookingService`: Booking operations (book, cancel, etc.)
- `AIService`: AI features (recommendations, location parsing)

## AI Integration

The project includes:

- Smart location parsing (normalizing text input to standard locations)
- Ride recommendations based on user history and patterns
- Journey time estimation based on traffic patterns

## Future Improvements

- Implement real-time updates without page refresh
- Add notifications system
- Improve AI recommendation accuracy
- Add map visualization for routes

## Contributors

- Team UniPool
