import os
from dotenv import load_dotenv

# Load environment variables from .env as early as possible
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from .core.llm import LLMConfig
from .core.orchestrator import build_simple_graph
from .routers import sync, search, graph, cothink, voice, matches, reputation
from langchain_core.messages import HumanMessage, SystemMessage
import time
from loguru import logger

app = FastAPI(title="THREX AI Service", version="0.1.0")
app.include_router(sync.router)
app.include_router(search.router)
app.include_router(graph.router)
app.include_router(cothink.router)
app.include_router(voice.router)
app.include_router(matches.router)
app.include_router(reputation.router)

class AIRequest(BaseModel):
    system_prompt: Optional[str] = "You are a helpful intellectual assistant."
    user_prompt: str
    config: LLMConfig = LLMConfig()

class AIResponse(BaseModel):
    content: str
    latency_ms: float
    model_used: str

@app.middleware("http")
async def monitor_ai_calls(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    logger.info(f"Path: {request.url.path} | Latency: {process_time:.2f}ms")
    return response

@app.post("/generate", response_model=AIResponse)
async def generate_content(request: AIRequest):
    try:
        start_time = time.time()
        graph = build_simple_graph()
        
        messages = [
            SystemMessage(content=request.system_prompt),
            HumanMessage(content=request.user_prompt)
        ]
        
        result = graph.invoke({
            "messages": messages,
            "config": request.config
        })
        
        latency = (time.time() - start_time) * 1000
        
        return AIResponse(
            content=result["output"],
            latency_ms=latency,
            model_used=request.config.model_name
        )
    except Exception as e:
        logger.error(f"AI Generation Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok"}
