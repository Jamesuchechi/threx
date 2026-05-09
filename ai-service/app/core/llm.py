from enum import Enum
from typing import Optional, Any
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field, ConfigDict
import os

class ModelProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GROQ = "groq"

class LLMConfig(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    
    provider: ModelProvider = ModelProvider.OPENAI
    model_name: str = "gpt-4o"
    temperature: float = 0.0
    max_tokens: Optional[int] = None
    api_key: Optional[str] = None

def get_llm(config: LLMConfig):
    """
    Factory function to get a LangChain LLM instance based on provider.
    """
    if config.provider == ModelProvider.OPENAI:
        return ChatOpenAI(
            model=config.model_name,
            temperature=config.temperature,
            max_tokens=config.max_tokens,
            api_key=config.api_key or os.getenv("OPENAI_API_KEY")
        )
    elif config.provider == ModelProvider.ANTHROPIC:
        return ChatAnthropic(
            model=config.model_name,
            temperature=config.temperature,
            max_tokens=config.max_tokens,
            api_key=config.api_key or os.getenv("ANTHROPIC_API_KEY")
        )
    elif config.provider == ModelProvider.GROQ:
        return ChatGroq(
            model=config.model_name,
            temperature=config.temperature,
            max_tokens=config.max_tokens,
            api_key=config.api_key or os.getenv("GROQ_API_KEY")
        )
    else:
        raise ValueError(f"Unsupported provider: {config.provider}")
