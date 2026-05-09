from fastapi import APIRouter, HTTPException
from ..core.matching import matching_service
from pydantic import BaseModel

router = APIRouter(prefix="/matches", tags=["matches"])

@router.get("/suggest/{user_id}")
async def get_suggested_matches(user_id: str):
    try:
        suggestions = await matching_service.generate_matches(user_id)
        return suggestions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
