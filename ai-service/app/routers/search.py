from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from ..core.search import search_service
from ..core.db import supabase
from loguru import logger

router = APIRouter(prefix="/search", tags=["search"])

class SearchRequest(BaseModel):
    query: str
    limit: Optional[int] = 10
    filters: Optional[Dict[str, Any]] = None

class SearchResult(BaseModel):
    id: str
    score: float
    metadata: Dict[str, Any]

@router.post("/semantic", response_model=List[SearchResult])
async def semantic_search(request: SearchRequest):
    try:
        results = search_service.semantic_search(
            query=request.query,
            limit=request.limit,
            filters=request.filters
        )
        return results
    except Exception as e:
        logger.error(f"Search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/smart-feed/{user_id}")
async def get_smart_feed(user_id: str, limit: int = 20):
    """
    Generates a personalized feed based on the user's recent intellectual activity.
    """
    try:
        # 1. Fetch user's recent nodes to build context
        res = supabase.table("nodes").select("content").eq("author_id", user_id).limit(5).execute()
        
        context_query = "foundational intellectual breakthroughs"
        if res.data:
            context_query = " ".join([n["content"] for n in res.data])

        # 2. Semantic search for similar nodes across the network
        results = search_service.semantic_search(
            query=context_query,
            limit=limit,
            filters={"author_id": {"$ne": user_id}}
        )

        return results

    except Exception as e:
        logger.error(f"Smart feed failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
