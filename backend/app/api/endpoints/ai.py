from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime

from app.core.security import get_current_user
from app.models.user import User
from app.ai.ai_service import AIService


router = APIRouter()


@router.get("/match", response_model=List[Dict[str, Any]])
async def match_rides(
    origin: str,
    destination: str,
    date: datetime = None,
    weight_rating: float = 0.3,
    weight_price: float = 0.3,
    weight_time_proximity: float = 0.4,
    current_user: User = Depends(get_current_user),
):
    """
    Match rides based on route, time, and rating
    """
    ai_service = AIService()
    matches = await ai_service.match_rides(
        user_id=current_user.id,
        origin=origin,
        destination=destination,
        date=date,
        weight_rating=weight_rating,
        weight_price=weight_price,
        weight_time_proximity=weight_time_proximity,
    )
    return matches


@router.get("/recommend/pickup-points", response_model=List[Dict[str, Any]])
async def recommend_pickup_points(
    university: str,
    current_user: User = Depends(get_current_user),
):
    """
    Recommend common pickup points based on historical data
    """
    ai_service = AIService()
    pickup_points = await ai_service.recommend_pickup_points(university)
    return pickup_points


@router.get("/normalize-location", response_model=str)
async def normalize_location(
    location_text: str,
    current_user: User = Depends(get_current_user),
):
    """
    Normalize location text to standard format
    """
    ai_service = AIService()
    normalized = ai_service.normalize_location(location_text)
    return normalized


@router.get("/user-patterns", response_model=Dict[str, Any])
async def analyze_user_patterns(
    current_user: User = Depends(get_current_user),
):
    """
    Analyze user ride patterns
    """
    ai_service = AIService()
    patterns = await ai_service.analyze_user_patterns(current_user.id)
    return patterns
