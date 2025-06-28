# 🚗 UniPool - Campus Ride Sharing Platform

**Code Jam 2.0 Project - Senior Track Implementation**

UniPool is a comprehensive ride-sharing platform connecting student drivers with riders traveling from across Lahore to their universities. It intelligently recommends rides based on users' schedules and preferences, emphasizing simplicity, convenience, and safety.

## 🎯 Project Vision

Think of UniPool as "Uber meets Google Calendar" - a platform that proactively matches rides and automates your daily commute from home to campus. For now, this is a **free service for students** - no payment processing required!

## ✨ Key Features

### 🏫 **University Integration**
- **Verified university email accounts** (formanite.fccollege.edu.pk)
- **Student-focused design** with campus-specific features
- **Free service model** for all students

### 🚗 **Smart Ride Management**
- **Real-time ride posting** with GPS integration
- **Intelligent route matching** with AI-powered recommendations
- **Recurring ride schedules** (Mon-Fri 8 AM from DHA to FCC)
- **Midway pickup support** along driver routes

### 🤖 **AI Integration**
- **Pattern recognition** for common routes and pickup points
- **Location parsing** - extract and normalize Lahore addresses
- **Smart suggestions** for optimal pickup points
- **Destination prediction** based on time, location, and patterns
- **Journey time estimation** with traffic patterns

### ⭐ **Rating & Safety System**
- **5-star rating system** (separate driver/rider ratings)
- **Safety features** with reasonable hours (6 AM - 10 PM)
- **Conflict resolution** with automatic penalties
- **User verification** through university emails

### 📱 **Real-Time Features**
- **Live GPS tracking** (3-second updates)
- **Real-time notifications** for new rides and bookings
- **Instant booking updates** across all users
- **Mobile-responsive design**

## 🏗️ Architecture

### **Senior Track Implementation**
- **Full-stack architecture** with RESTful API design
- **Service layer pattern** for clean separation of concerns
- **Real-time updates** via WebSocket/polling
- **Database integration** (Firebase/Supabase/PostgreSQL ready)

### **API Contracts**
Clear interfaces defined for team collaboration:
- `UserAPI` - Authentication, profiles, ratings
- `RideAPI` - Ride management, bookings, search
- `AIAPI` - Recommendations, matching, location parsing
- `NotificationAPI` - Real-time updates, push notifications
- `SafetyAPI` - Safety checks, conflict resolution

## 🛠️ Tech Stack

### **Frontend**
- **React** with modern hooks and context
- **Tailwind CSS** for responsive design
- **Mapbox GL JS** for advanced mapping
- **Real-time updates** with WebSocket/polling

### **Backend (Ready for Integration)**
- **RESTful API** design with proper error handling
- **Service layer** with async/await patterns
- **Authentication** with JWT tokens
- **Database** - Firebase/Supabase/PostgreSQL ready

### **AI Integration**
- **OpenAI GPT-3.5-turbo** for location parsing
- **Rule-based fallback** for reliability
- **Pattern recognition** algorithms
- **Smart recommendations** engine

### **Maps & Location**
- **Mapbox GL JS** with custom styling
- **Geocoding API** for address suggestions
- **Route calculation** with turn-by-turn directions
- **GPS integration** with real-time tracking

## 🚀 Getting Started

### **Prerequisites**
- Node.js 16+ 
- npm or yarn
- Mapbox API key (free tier available)
- OpenAI API key (optional, for AI features)

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd unipool
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
```

Add your API keys to `.env`:
```env
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
REACT_APP_OPENAI_API_KEY=your_openai_key
REACT_APP_API_URL=http://localhost:3001/api
```

4. **Start development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:5174
```

## 🧪 Testing

### **Multi-User Testing**
Since we're using localStorage (shared across tabs), you can simulate multi-user functionality:

1. **Open multiple browser tabs**
2. **Login as different users in each tab**
3. **Post rides in one tab, book in another**
4. **Watch real-time updates across tabs**

### **Test Users**
```
Student1: student1@fccu.edu.pk (password: password123)
Student2: student2@fccu.edu.pk (password: password123)
```

### **Demo Scenarios**
1. **Driver posts ride** → Appears in real-time
2. **Rider searches and books** → Seat count updates
3. **Real-time sync** → Updates across all tabs
4. **Rating system** → After ride completion

## 🤖 AI Integration Details

### **Location Parsing**
- **AI-powered parsing** with OpenAI GPT-3.5-turbo
- **Rule-based fallback** for reliability
- **Normalizes Lahore addresses** to standard format
- **Confidence scoring** for parsing accuracy

### **Route Matching**
- **Pattern recognition** for common routes
- **Time-based matching** (±30 minutes)
- **Area-based matching** with proximity scoring
- **User preference learning**

### **Smart Recommendations**
- **Personalized ride suggestions**
- **Optimal pickup point suggestions**
- **Journey time estimation**
- **Destination prediction**

### **AI Usage Summary**
```javascript
{
  features: [
    'Location parsing and normalization',
    'Route matching and recommendations', 
    'Journey time estimation',
    'Pattern recognition',
    'Destination prediction',
    'Optimal pickup point suggestions'
  ],
  models: ['OpenAI GPT-3.5-turbo', 'Rule-based fallback'],
  endpoints: [
    '/api/ai/recommendations',
    '/api/ai/match',
    '/api/ai/pickup-suggestions',
    '/api/ai/estimate-time',
    '/api/ai/patterns/:userId',
    '/api/ai/predict-destinations'
  ]
}
```

## 📊 Database Schema

### **Users Collection**
```javascript
{
  id: "string",
  email: "string (formanite.fccollege.edu.pk domain)",
  name: "string",
  role: "driver|rider|both",
  major: "string",
  year: "number",
  phone: "string",
  ratings: {
    driver: { total: number, count: number },
    rider: { total: number, count: number }
  },
  createdAt: "timestamp",
  timezone: "Asia/Karachi"
}
```

### **Rides Collection**
```javascript
{
  id: "string",
  driverId: "string",
  pickup: "string",
  dropoff: "string", 
  departureTime: "timestamp",
  seats: "number",
  availableSeats: "number",
  route: ["string"],
  status: "active|cancelled|completed",
  bookings: [{
    riderId: "string",
    status: "pending|confirmed|cancelled",
    pickupPoint: "string",
    bookingTime: "timestamp"
  }],
  recurring: {
    enabled: "boolean",
    days: ["string"]
  },
  createdAt: "timestamp"
}
```

## 🔒 Safety Features

### **Implemented Safety Measures**
1. **University email verification** (formanite.fccollege.edu.pk)
2. **Reasonable hours restriction** (6 AM - 10 PM)
3. **Driver/rider mutual rating system**
4. **Automatic penalty system** for cancellations
5. **User safety scoring** with warnings

### **Conflict Resolution**
- **First-come, first-served** booking system
- **Automatic penalties** for late cancellations
- **Real-time seat validation** to prevent overbooking
- **User flagging** for low-rated users

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Mobile phones** (320px - 768px)
- **Tablets** (768px - 1024px) 
- **Desktop** (1024px+)

## 🚀 Deployment

### **Static Deployment Ready**
The app is configured for static deployment on:
- **GitHub Pages**
- **Netlify**
- **Vercel**
- **Any static hosting service**

### **Build for Production**
```bash
npm run build
```

## 🔮 Future Enhancements

### **Planned Features**
- **Payment integration** (when moving to paid model)
- **Advanced AI features** with machine learning
- **Social features** (ride groups, communities)
- **Emergency features** (SOS button, location sharing)
- **Analytics dashboard** for drivers

### **Backend Integration**
- **Firebase/Supabase** for real-time database
- **PostgreSQL** for complex queries
- **Redis** for caching and sessions
- **WebSocket** for real-time updates

## 👥 Team Structure

### **Member Responsibilities**
- **Member A**: Frontend UI, responsive design, ride search
- **Member B**: User management, authentication, profiles
- **Member C**: Ride system, bookings, cancellations  
- **Member D**: AI integration, route matching, ratings

### **API Contracts**
Clear interfaces defined for parallel development:
- Each member owns their service layer
- Shared contracts for integration
- Async/await patterns for future backend integration

## 📄 License

This project is developed for Code Jam 2.0 competition.

## 🤝 Contributing

This is a competition project. For questions or issues, please contact the development team.

---

**Built with ❤️ for the student community of Lahore**
