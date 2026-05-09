from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
from ..core.llm import get_llm, LLMConfig
from ..core.search import search_service
from langchain_core.messages import SystemMessage, HumanMessage
import asyncio
import json

router = APIRouter(prefix="/cothink", tags=["cothink"])

class CoThinkRequest(BaseModel):
    content: str
    mode: str = "socratic" # socratic, steelman, evidence, debate
    node_id: Optional[str] = None
    context_nodes: Optional[List[str]] = []

def get_system_prompt(mode: str, context_str: str):
    prompts = {
        "socratic": f"You are a Socratic tutor. Ask probing questions that reveal underlying assumptions. Context: {context_str}",
        "steelman": f"You are a Steel-man advocate. Formulate the strongest possible version of the user's argument. Context: {context_str}",
        "evidence": f"You are an Evidence researcher. Search for empirical support or counter-examples. Context: {context_str}",
        "debate": f"You are a Debate opponent. Challenge the user's logic with formal counter-arguments. Context: {context_str}"
    }
    return prompts.get(mode, prompts["socratic"])

@router.post("/stream")
async def stream_cothink(request: CoThinkRequest):
    """
    Streaming endpoint for the co-thinking engine using SSE.
    """
    try:
        # 1. Fetch evidence from Pinecone
        evidence_nodes = search_service.semantic_search(
            query=request.content,
            limit=5
        )
        context_str = "\n".join([f"- {n['metadata'].get('title')}: {n['metadata'].get('content')}" for n in evidence_nodes])

        # 2. Setup LLM (using streaming-capable model)
        llm = get_llm(LLMConfig(model_name="gpt-4o", temperature=0.7))

        async def generate():
            system_prompt = get_system_prompt(request.mode, context_str)
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=request.content)
            ]
            
            # Using synchronous stream for simplicity in v1, but wrapping in thread or using async if possible
            # LangChain .stream() is sync by default unless using async llm
            for chunk in llm.stream(messages):
                yield f"data: {json.dumps({'content': chunk.content})}\n\n"
                await asyncio.sleep(0.01) # Small sleep to ensure streaming feel
            
            yield "data: [DONE]\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
