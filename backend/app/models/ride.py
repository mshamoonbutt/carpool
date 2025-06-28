from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class RideCreate(BaseModel):
    pickup: str
    dropoff: str
    departure_time: datetime
    seats: int
    route: Optional[List[str]] = []
    recurring_days: Optional[List[str]] = []
