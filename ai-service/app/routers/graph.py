from fastapi import APIRouter, HTTPException
from ..core.graph import graph_service
from typing import List, Dict, Any

router = APIRouter(prefix="/graph", tags=["graph"])

@router.get("/connections/{node_id}")
async def get_node_connections(node_id: str):
    try:
        connections = graph_service.get_connections(node_id)
        return connections
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
