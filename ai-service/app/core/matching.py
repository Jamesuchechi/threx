from .search import search_service
from .llm import get_llm, LLMConfig
from .db import supabase
from langchain_core.messages import SystemMessage, HumanMessage
from typing import List, Dict, Any
import numpy as np
from loguru import logger

class MatchingService:
    def __init__(self):
        self.llm = get_llm(LLMConfig(model_name="gpt-4o", temperature=0.7))

    async def generate_matches(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Generates intellectual match suggestions for a user based on semantic overlap and tension.
        """
        try:
            # 1. Fetch user's nodes to build a profile
            res = supabase.table("nodes").select("id, content, title").eq("author_id", user_id).limit(20).execute()
            if not res.data:
                return []

            # 2. Get embeddings for user's content (Simplified: use search_service to find similar nodes first)
            # Find nodes NOT by this user that are semantically similar
            aggregated_content = " ".join([n["content"] for n in res.data])
            similar_parallels = search_service.semantic_search(
                query=aggregated_content,
                limit=20,
                filters={"author_id": {"$ne": user_id}}
            )

            # 3. Group by author and calculate scores
            author_matches = {}
            for match in similar_parallels:
                author_id = match["metadata"].get("author_id")
                if not author_id: continue
                
                if author_id not in author_matches:
                    author_matches[author_id] = {
                        "score": 0,
                        "nodes": [],
                        "top_score": 0
                    }
                
                author_matches[author_id]["score"] += match["score"]
                author_matches[author_id]["nodes"].append(match)
                author_matches[author_id]["top_score"] = max(author_matches[author_id]["top_score"], match["score"])

            # 4. Refine Top 5 Matches
            sorted_authors = sorted(author_matches.items(), key=lambda x: x[1]["score"], reverse=True)[:5]
            final_suggestions = []

            for target_id, data in sorted_authors:
                # Fetch target profile
                target_profile = supabase.table("profiles").select("*").eq("id", target_id).single().execute().data
                
                # Generate AI Match Reason
                reason_prompt = f"""
                Analyze the connection between User A and User B.
                
                User A focus: {aggregated_content[:500]}...
                User B focus (via their nodes): {data['nodes'][0]['metadata'].get('title')} - {data['nodes'][0]['metadata'].get('content')[:300]}
                
                Why should they connect? 
                Mention a shared interest or a productive tension (e.g., 'Both explore X, but B challenges A's view on Y').
                Max 20 words.
                """
                
                response = self.llm.invoke([
                    SystemMessage(content="You are an intellectual matchmaker."),
                    HumanMessage(content=reason_prompt)
                ])
                
                final_suggestions.append({
                    "user_id": target_id,
                    "profile": target_profile,
                    "match_score": round(data["top_score"], 2),
                    "reason": response.content.strip()
                })

            return final_suggestions

        except Exception as e:
            logger.error(f"Match generation failed: {str(e)}")
            return []

matching_service = MatchingService()
