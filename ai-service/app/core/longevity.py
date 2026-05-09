from .llm import get_llm, LLMConfig
from .search import search_service
from langchain_core.messages import SystemMessage, HumanMessage
from typing import Dict, Any
import json
from loguru import logger

class LongevityService:
    def __init__(self):
        self.llm = get_llm(LLMConfig(model_name="gpt-4o", temperature=0.0))

    async def calculate_longevity(self, node_id: str, content: str, title: str, domain: str) -> Dict[str, Any]:
        """
        Calculates the intellectual longevity of a node based on novelty, evidence, and domain velocity.
        """
        try:
            # 1. Novelty Check (Semantic Distance)
            similar_nodes = search_service.semantic_search(query=content, limit=5, filters={"id": {"$ne": node_id}})
            novelty_factor = 1.0
            if similar_nodes:
                top_score = similar_nodes[0]["score"]
                novelty_factor = max(0.1, 1.0 - top_score) # Closer they are, lower the novelty

            # 2. Evidence & Depth Analysis via LLM
            prompt = f"""
            Analyze the following intellectual contribution for long-term durability.
            
            Title: {title}
            Domain: {domain}
            Content: {content}
            
            Novelty Factor (Calculated): {novelty_factor:.2f}
            
            Evaluate based on:
            1. Evidence Density: Ratio of specific claims to verifiable evidence/logic.
            2. Foundational Potential: Does it define a new paradigm or just add a footnote?
            3. Domain Velocity: In {domain}, how fast do ideas become obsolete?
            
            Return JSON with:
            - score: 0.0 to 1.0
            - band: one of [ephemeral, durable, foundational, contrarian]
            - reasoning: concise explanation (max 15 words)
            """
            
            response = self.llm.invoke([
                SystemMessage(content="You are a meta-intellectual analyst evaluating the Lindy Effect on ideas."),
                HumanMessage(content=prompt)
            ])
            
            result = json.loads(response.content.replace("```json", "").replace("```", "").strip())
            
            # Combine calculated novelty with LLM judgment
            final_score = (result["score"] * 0.7) + (novelty_factor * 0.3)
            
            return {
                "score": round(final_score, 2),
                "band": result["band"],
                "reasoning": result["reasoning"]
            }

        except Exception as e:
            logger.error(f"Longevity calculation failed for {node_id}: {str(e)}")
            return {"score": 0.5, "band": "durable", "reasoning": "Standard durability assigned due to analysis error."}

longevity_service = LongevityService()
