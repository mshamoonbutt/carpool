from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.models.user import User, UserUpdate
from app.services.user_service import UserService


router = APIRouter()


@router.get("/me", response_model=User)
async def get_current_user_data(current_user: User = Depends(get_current_user)):
    """
    Get current user data
    """
    return current_user


@router.put("/me", response_model=User)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
):
    """
    Update current user
    """
    user_service = UserService()
    updated_user = await user_service.update(current_user.id, user_update)
    return updated_user


@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Get user by ID
    """
    user_service = UserService()
    user = await user_service.get_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    return user


@router.get("/", response_model=List[User])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    """
    Get all users
    """
    user_service = UserService()
    users = await user_service.get_all(skip=skip, limit=limit)
    return users
