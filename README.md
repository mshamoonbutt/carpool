# UniPool - Campus Ride Sharing Platform

UniPool is a comprehensive ride-sharing platform designed specifically for university students, connecting drivers and riders traveling to and from Forman Christian College (FCC) in Lahore, Pakistan.

## 🚀 Live Demo

**Demo URL**: [Your deployment URL here]

Visit the [Demo Page](/demo) to experience the full functionality with pre-loaded sample data and user switching capabilities.

## ✨ Features

### Core Functionality
- **User Registration & Authentication** with university email verification
- **Ride Creation & Management** for drivers with recurring ride options
- **Advanced Ride Search** with location and time-based filtering
- **Real-time Booking System** with seat availability tracking
- **Comprehensive Rating System** with mutual driver/rider ratings
- **Profile Management** with ride history and statistics

### Safety & Policies
- University email domain verification (@formanite.fccollege.edu.pk, @fccollege.edu.pk)
- Ride time restrictions (6 AM - 10 PM)
- Cancellation policies with automatic rating penalties
- Mutual rating system for accountability

### Smart Features
- Route-based matching algorithm
- Time window flexibility for ride searches
- Recurring ride scheduling
- Real-time seat availability updates
- Pattern recognition for common routes

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Data Storage**: localStorage (simulating shared database)
- **Architecture**: Service Layer Pattern with REST-like APIs

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

1. **Clone the repository**
   \`\`\`bash
   git clone [repository-url]
   cd unipool
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Run development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Deployment

This is a static Next.js application that can be deployed to any static hosting service:

**Vercel (Recommended)**
\`\`\`bash
npm run build
npx vercel --prod
\`\`\`

**Netlify**
\`\`\`bash
npm run build
# Upload the 'out' folder to Netlify
\`\`\`

**GitHub Pages**
\`\`\`bash
npm run build
# Deploy the 'out' folder to GitHub Pages
\`\`\`

## 🎯 Demo Usage

### Quick Start with Sample Data

1. **Visit Demo Page**: Go to `/demo` to access the user switcher
2. **Seed Data**: Click "Seed Sample Data" to populate with realistic users and rides
3. **Switch Users**: Select different users to experience various roles:
   - **Ahmed Hassan** (Both) - 4.8★ rating, 15 rides
   - **Ali Raza** (Driver) - 4.9★ rating, 22 rides  
   - **Fatima Khan** (Rider) - 4.6★ rating, 8 rides
   - **Dr. Muhammad Tariq** (Faculty Driver) - 4.7★ rating, 12 rides

### Multi-User Testing

Open multiple browser tabs with different users to simulate real-time interactions:
- Tab 1: Driver posting a ride
- Tab 2: Rider searching and booking
- Tab 3: Another rider viewing the updated availability

## 🤖 AI/LLM Integration

### Current AI Use Cases

1. **Route Optimization**
   - Smart pickup point suggestions along driver routes
   - Optimal route planning based on multiple pickup/dropoff points

2. **Pattern Recognition**
   - Common route identification (e.g., DHA → FCC morning patterns)
   - Frequent pickup/dropoff pair analysis
   - Time-based demand prediction

3. **Smart Matching**
   - Intelligent rider-driver pairing based on:
     - Location proximity and route compatibility
     - Time preferences and flexibility
     - User ratings and compatibility scores
     - Historical ride patterns

4. **Predictive Features**
   - Journey time estimation based on traffic patterns
   - Demand forecasting for popular routes
   - Optimal departure time suggestions

### Future AI Enhancements

- **Natural Language Processing** for ride descriptions and reviews
- **Computer Vision** for vehicle and user verification
- **Machine Learning** for fraud detection and safety scoring
- **Chatbot Integration** for customer support and ride coordination

## 🏗 Architecture

### Service Layer Pattern

The application follows a clean service layer architecture:

\`\`\`
services/
├── AuthService.ts      # User authentication & management
├── RideService.ts      # Ride CRUD operations & search
├── BookingService.ts   # Booking management & validation
├── RatingService.ts    # Rating system & user score updates
└── SeedDataService.ts  # Demo data management
\`\`\`

### Data Storage Strategy

**localStorage Simulation Approach**:
- **Why localStorage over sessionStorage**: Persistence across tabs and sessions enables multi-user simulation
- **Shared Database Simulation**: All tabs share the same localStorage, simulating a real database
- **Data Structure**: JSON-based storage with proper indexing and relationships
- **Real-time Updates**: Service layer handles data synchronization across components

### API Design

RESTful service methods following standard conventions:

\`\`\`typescript
// User Management
AuthService.register(userData) -> Promise<User>
AuthService.login(email, password) -> Promise<User>
AuthService.getCurrentUser() -> User | null

// Ride Management  
RideService.createRide(rideData) -> Promise<Ride>
RideService.searchRides(filters) -> Promise<Ride[]>
RideService.getUserRides(userId) -> Promise<Ride[]>

// Booking System
BookingService.createBooking(bookingData) -> Promise<Booking>
BookingService.cancelBooking(bookingId) -> Promise<boolean>

// Rating System
RatingService.createRating(ratingData) -> Promise<Rating>
RatingService.getUserRatings(userId) -> Promise<Rating[]>
\`\`\`

## 📊 Sample Data

The application includes comprehensive seed data:

- **6 Sample Users** with varied roles and ratings
- **10+ Active Rides** across different areas and times
- **Authentic Ratings** with reviews and scoring
- **Realistic Scenarios** including faculty and student accounts

## 🔒 Safety & Security

### Email Verification
- Domain validation for FCC email addresses
- Student domain: `@formanite.fccollege.edu.pk`
- Faculty/Staff domain: `@fccollege.edu.pk`

### Ride Safety
- Time restrictions (6 AM - 10 PM)
- Mutual rating system
- Cancellation policies with penalties
- User verification through university email

### Data Privacy
- Client-side data storage (no server-side data collection)
- User consent for profile information
- Transparent data usage policies

## 🚧 Known Limitations

### Current Limitations

1. **No Real-time Messaging**: Basic contact through provided phone numbers
2. **Static Maps**: Location selection via dropdown (no interactive maps yet)
3. **No Payment Processing**: Free service model as specified
4. **Limited Notifications**: Basic alert-based notifications
5. **No Email Verification**: Domain checking only (no actual email sending)

### Technical Constraints

1. **localStorage Limitations**: 
   - 5-10MB storage limit per domain
   - Data loss if user clears browser data
   - No server-side backup

2. **Client-side Only**:
   - No real-time synchronization between users
   - No server-side validation
   - Limited scalability

## 🔮 Future Improvements

### Short-term Enhancements
- Interactive map integration (Google Maps/Mapbox)
- Real-time messaging system
- Push notifications for ride updates
- Advanced search filters (car type, music preferences, etc.)

### Long-term Vision
- Mobile app development (React Native)
- Integration with university systems
- Payment processing for premium features
- Advanced AI-powered matching algorithms
- Multi-university expansion

### Scalability Roadmap
- Backend API development (Node.js/Express)
- Database migration (PostgreSQL/MongoDB)
- Real-time features (WebSocket/Socket.io)
- Microservices architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Visit the demo page for interactive examples

---

**UniPool** - Connecting FCC students through safe, convenient ride sharing 🚗✨
