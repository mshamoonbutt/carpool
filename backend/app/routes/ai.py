from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def ai_base():
    return {"message": "AI route is active"}
