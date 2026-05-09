from typing import List, Dict, Any, Optional
from .search import search_service
from .graph import graph_service
from .llm import get_llm, LLMConfig
from .longevity import longevity_service
from .db import update_node_longevity
from .reputation import reputation_service
from langchain_core.messages import SystemMessage, HumanMessage
from loguru import logger
import os

async def process_node_connections(node_id: str, content: str, title: str, node_type: str, author_id: str):
    """
    Background job to find semantic parallels and create graph edges.
    """
    try:
        # 1. Ensure node exists in Neo4j
        graph_service.create_node(node_id, title, node_type)

        # 2. Find similar nodes in Pinecone
        parallels = search_service.semantic_search(
            query=content,
            limit=5,
            filters={"id": {"$ne": node_id}}
        )

        llm = get_llm(LLMConfig(model_name="gpt-4o", temperature=0.3))

        for parallel in parallels:
            score = parallel["score"]
            if score >= 0.82:
                # 3. Generate connection reason via LLM
                target_title = parallel["metadata"].get("title", "Unknown")
                target_content = parallel["metadata"].get("content", "")

                prompt = f"""
                Source Node Title: {title}
                Source Node Content: {content}

                Target Node Title: {target_title}
                Target Node Content: {target_content}

                Analyze the intellectual connection between these two nodes. 
                Explain why they are related in one concise sentence (max 20 words).
                Start with a verb like 'Builds on', 'Challenges', 'Provides evidence for', 'Extends', etc.
                """
                
                response = llm.invoke([
                    SystemMessage(content="You are an intellectual graph analyzer."),
                    HumanMessage(content=prompt)
                ])
                
                reason = response.content.strip()

                # 4. Write to Neo4j
                graph_service.create_node(parallel["id"], target_title, parallel["metadata"].get("type", "Node"))
                graph_service.create_connection(node_id, parallel["id"], reason, score)
                
                logger.info(f"Created AI connection: {node_id} -> {parallel['id']} ({reason})")

        # 5. Contradiction Detection
        if node_type in ['claim', 'hypothesis']:
            await detect_contradictions(node_id, content, title, parallels, llm)

        # 6. Longevity Scoring
        longevity = await longevity_service.calculate_longevity(node_id, content, title, node_type)
        update_node_longevity(node_id, longevity["score"], longevity["band"], longevity["reasoning"])
        logger.info(f"Assigned longevity score to {node_id}: {longevity['score']} ({longevity['band']})")

        # 7. Reputation Events
        reputation_service.log_event(author_id, "node_published", node_type, node_id)
        if longevity["band"] == "foundational":
            reputation_service.log_event(author_id, "high_longevity", node_type, node_id)

    except Exception as e:
        logger.error(f"Connection processing failed for {node_id}: {str(e)}")

async def detect_contradictions(node_id: str, content: str, title: str, parallels: list, llm: Any):
    """
    Analyzes semantically similar nodes for potential logical contradictions.
    """
    for parallel in parallels:
        if parallel["score"] >= 0.75: # Lower threshold for contradictions
            target_title = parallel["metadata"].get("title", "Unknown")
            target_content = parallel["metadata"].get("content", "")

            prompt = f"""
            Analyze if these two intellectual contributions contradict each other.
            
            Contribution A: {title} - {content}
            Contribution B: {target_title} - {target_content}
            
            Are they mutually exclusive or logically inconsistent?
            Respond only with 'YES' or 'NO' followed by a brief 10-word explanation.
            """
            
            response = llm.invoke([
                SystemMessage(content="You are a formal logic analyzer."),
                HumanMessage(content=prompt)
            ])
            
            verdict = response.content.strip().upper()
            if verdict.startswith("YES"):
                reason = verdict.replace("YES", "").strip(": ").strip()
                # Store contradiction in Neo4j with a specific relationship
                graph_service.create_connection(node_id, parallel["id"], f"CONTRADICTS: {reason}", -1.0)
                logger.warning(f"Contradiction detected: {node_id} !! {parallel['id']}")
