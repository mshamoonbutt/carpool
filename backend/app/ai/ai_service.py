from typing import List, Dict, Any
from datetime import datetime

from app.services.ride_service import RideService
from app.services.user_service import UserService
from app.services.rating_service import RatingService


class AIService:
    """AI service for ride matching and recommendations."""
    
    async def match_rides(
        self,
        user_id: str,
        origin: str,
        destination: str,
        date: datetime = None,
        weight_rating: float = 0.3,
        weight_price: float = 0.3,
        weight_time_proximity: float = 0.4,
    ) -> List[Dict[str, Any]]:
        """
        Match rides based on route, time, and rating.
        
        Args:
            user_id: User ID to match rides for
            origin: Starting location (will do fuzzy matching)
            destination: Ending location (will do fuzzy matching)
            date: Optional date for ride
            weight_rating: Weight for driver rating in matching score
            weight_price: Weight for price in matching score
            weight_time_proximity: Weight for time proximity in matching score
            
        Returns:
            List of rides with matching scores
        """
        ride_service = RideService()
        user_service = UserService()
        rating_service = RatingService()
        
        # Get available rides
        rides = await ride_service.search_rides(
            origin=origin,
            destination=destination,
            date=date
        )
        
        if not rides:
            return []
        
        # Score each ride
        scored_rides = []
        for ride in rides:
            # Get driver info and rating
            driver = await user_service.get_by_id(ride.driver_id)
            avg_rating = await rating_service.get_average_rating(ride.driver_id)
            
            # Calculate normalized scores (0-1 scale)
            normalized_rating_score = min(avg_rating / 5.0, 1.0)
            
            # Price score (lower is better)
            # Find max price among all rides
            max_price = max([r.price for r in rides])
            normalized_price_score = 1.0 - (ride.price / max_price if max_price > 0 else 0)
            
            # Time proximity score (placeholder - in real app would use geolocation data)
            # For demo, we'll use a random value between 0-1
            import random
            normalized_time_score = random.random()
            
            # Calculate final score
            final_score = (
                weight_rating * normalized_rating_score +
                weight_price * normalized_price_score +
                weight_time_proximity * normalized_time_score
            )
            
            # Add to scored rides
            scored_rides.append({
                "ride": {
                    "id": ride.id,
                    "origin": ride.origin,
                    "destination": ride.destination,
                    "date": ride.date.isoformat(),
                    "time": ride.time,
                    "price": ride.price,
                    "seats_available": ride.seats_available,
                    "description": ride.description,
                    "driver": {
                        "id": driver.id,
                        "full_name": driver.full_name,
                        "rating": avg_rating,
                    },
                },
                "matching_score": final_score,
                "score_breakdown": {
                    "rating": normalized_rating_score,
                    "price": normalized_price_score,
                    "time_proximity": normalized_time_score,
                },
            })
        
        # Sort by matching score
        scored_rides.sort(key=lambda x: x["matching_score"], reverse=True)
        
        return scored_rides
    
    async def recommend_pickup_points(self, university: str) -> List[Dict[str, Any]]:
        """
        Recommend common pickup points based on historical data.
        
        Args:
            university: University name to get pickup points for
            
        Returns:
            List of recommended pickup points with frequency
        """
        db = await get_database()
        
        # Aggregate common origins for rides going to this university
        pipeline = [
            {"$match": {"destination": {"$regex": university, "$options": "i"}}},
            {"$group": {"_id": "$origin", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        
        results = await db.carpool.rides.aggregate(pipeline).to_list(length=5)
        
        # Format results
        pickup_points = [{"location": r["_id"], "frequency": r["count"]} for r in results]
        
        # If no results, return some defaults
        if not pickup_points and university.lower().find("lahore") >= 0:
            # Default pickup points for Lahore
            pickup_points = [
                {"location": "DHA Phase 5", "frequency": 15},
                {"location": "Johar Town", "frequency": 12},
                {"location": "Gulberg", "frequency": 10},
                {"location": "Model Town", "frequency": 8},
                {"location": "Bahria Town", "frequency": 7},
            ]
        
        return pickup_points
    
    def normalize_location(self, location_text: str) -> str:
        """
        Normalize location text to standard format.
        
        Args:
            location_text: Raw location text from user input
            
        Returns:
            Normalized location text
        """
        # This would use NLP or some mapping in a real application
        # For now, let's just do some simple text normalization
        
        location_text = location_text.strip().lower()
        
        # Map common abbreviations and typos
        location_map = {
            "dha": "DHA",
            "defence": "DHA",
            "bahria": "Bahria Town",
            "johar": "Johar Town",
            "model": "Model Town",
            "lums": "LUMS University",
            "fast": "FAST NUCES",
            "nust": "NUST University",
            "comsats": "COMSATS University",
        }
        
        for key, value in location_map.items():
            if key in location_text:
                return value
                
        # If no match, capitalize properly
        return " ".join(word.capitalize() for word in location_text.split())
        
    async def analyze_user_patterns(self, user_id: str) -> Dict[str, Any]:
        """
        Analyze user ride patterns.
        
        Args:
            user_id: User ID to analyze patterns for
            
        Returns:
            Dictionary with user patterns
        """
        ride_service = RideService()
        
        # Get user rides
        driver_rides = await ride_service.get_user_rides(user_id, role="driver")
        passenger_rides = await ride_service.get_user_rides(user_id, role="passenger")
        
        # Analyze patterns (simplified for demo)
        all_rides = driver_rides + passenger_rides
        
        # Get common origins and destinations
        origins = {}
        destinations = {}
        
        for ride in all_rides:
            origins[ride.origin] = origins.get(ride.origin, 0) + 1
            destinations[ride.destination] = destinations.get(ride.destination, 0) + 1
        
        # Get common times
        times = {}
        for ride in all_rides:
            times[ride.time] = times.get(ride.time, 0) + 1
        
        # Format results
        top_origins = sorted(origins.items(), key=lambda x: x[1], reverse=True)[:3]
        top_destinations = sorted(destinations.items(), key=lambda x: x[1], reverse=True)[:3]
        top_times = sorted(times.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            "top_origins": [{"location": loc, "frequency": freq} for loc, freq in top_origins],
            "top_destinations": [{"location": loc, "frequency": freq} for loc, freq in top_destinations],
            "top_times": [{"time": time, "frequency": freq} for time, freq in top_times],
            "total_rides": len(all_rides),
            "driver_rides": len(driver_rides),
            "passenger_rides": len(passenger_rides),
        }
