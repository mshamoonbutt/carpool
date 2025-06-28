from pydantic import Field, BaseModel
from typing import Optional
from datetime import datetime


class RatingBase(BaseModel):
    ride_id: str
    rater_id: str
    rated_id: str
    score: int  # 1-5
    comment: Optional[str] = None
    
    class Config:
        arbitrary_types_allowed = True


class RatingCreate(RatingBase):
    pass


class RatingInDB(RatingBase):
    id: str = Field(..., alias="_id")
    created_at: datetime
    
    class Config:
        populate_by_name = True


class Rating(RatingBase):
    id: str
    created_at: datetime
    
    @classmethod
    def from_db(cls, rating_db: RatingInDB) -> "Rating":
        return cls(
            id=str(rating_db.id),
            ride_id=rating_db.ride_id,
            rater_id=rating_db.rater_id,
            rated_id=rating_db.rated_id,
            score=rating_db.score,
            comment=rating_db.comment,
            created_at=rating_db.created_at,
        )
