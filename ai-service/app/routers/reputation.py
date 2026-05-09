from fastapi import APIRouter, HTTPException
from ..core.reputation import reputation_service
from pydantic import BaseModel

router = APIRouter(prefix="/reputation", tags=["reputation"])

class SettleClaimRequest(BaseModel):
    claim_id: str
    resolution: str # 'resolved_true' or 'resolved_false'

@router.post("/settle")
async def settle_claim(request: SettleClaimRequest):
    try:
        reputation_service.settle_claim(request.claim_id, request.resolution)
        return {"status": "claim_settled"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
