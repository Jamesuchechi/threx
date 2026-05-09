from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any
from ..core.search import search_service
from ..core.connections import process_node_connections
from loguru import logger

router = APIRouter(prefix="/sync", tags=["sync"])

class NodeSyncRequest(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any]

@router.post("/node")
async def sync_node(request: NodeSyncRequest, background_tasks: BackgroundTasks):
    """
    Endpoint for Supabase webhooks to trigger node embedding and indexing.
    """
    try:
        background_tasks.add_task(
            search_service.upsert_node,
            request.id,
            request.content,
            request.metadata
        )
        # Trigger background connection job
        background_tasks.add_task(
            process_node_connections,
            request.id,
            request.content,
            request.metadata.get("title", ""),
            request.metadata.get("type", "Node"),
            request.metadata.get("author_id", "")
        )
        return {"status": "sync_queued"}
    except Exception as e:
        logger.error(f"Sync failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
