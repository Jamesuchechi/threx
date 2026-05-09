from .db import supabase
from typing import Optional
from loguru import logger

EVENT_WEIGHTS = {
    "node_published": 5,
    "citation_received": 15,
    "high_longevity": 25, # Foundational band
    "contradiction_detected": -10,
    "claim_staked": 10
}

class ReputationService:
    @staticmethod
    def log_event(user_id: str, event_type: str, domain: str, node_id: Optional[str] = None):
        """
        Logs a reputation event and triggers a score recalculation for the user-domain pair.
        """
        try:
            weight = EVENT_WEIGHTS.get(event_type, 0)
            if weight == 0:
                return

            # 1. Log Event
            supabase.table("reputation_events").insert({
                "user_id": user_id,
                "node_id": node_id,
                "event_type": event_type,
                "domain": domain,
                "weight": weight
            }).execute()

            # 2. Recalculate Aggregate Score for User/Domain
            ReputationService.recalculate_score(user_id, domain)

        except Exception as e:
            logger.error(f"Failed to log reputation event: {str(e)}")

    @staticmethod
    def recalculate_score(user_id: str, domain: str):
        """
        Recalculates the total reputation score for a user within a specific domain.
        """
        res = supabase.table("reputation_events").select("weight").eq("user_id", user_id).eq("domain", domain).execute()
        total_score = sum([row["weight"] for row in res.data])

        supabase.table("reputation_scores").upsert({
            "user_id": user_id,
            "domain": domain,
            "score": total_score,
            "updated_at": "now()"
        }, on_conflict="user_id, domain").execute()

    @staticmethod
    def settle_claim(claim_id: str, resolution: str):
        """
        Settles all reputation positions for a resolved claim.
        resolution: 'resolved_true' or 'resolved_false'
        """
        try:
            # 1. Fetch all positions for this claim
            positions = supabase.table("claim_positions").select("*").eq("claim_id", claim_id).execute()
            
            # 2. Map resolution to position
            correct_position = "agree" if resolution == "resolved_true" else "disagree"

            for pos in positions.data:
                user_id = pos["user_id"]
                # Reward/Penalize based on accuracy and confidence
                is_correct = pos["position"] == correct_position
                
                # Base weight: Correct (+20), Incorrect (-15)
                # Multiplied by confidence (1-5) / 3 (normalized)
                confidence_multiplier = pos["confidence"] / 3.0
                base_weight = 20 if is_correct else -15
                final_weight = int(base_weight * confidence_multiplier)

                # Log settlement event
                supabase.table("reputation_events").insert({
                    "user_id": user_id,
                    "event_type": "claim_settlement",
                    "domain": "claim", # Could be more specific
                    "weight": final_weight,
                    "node_id": None # Link to claim node if possible
                }).execute()

                # Recalculate user score (all domains or specific?)
                # For now, recalculate 'claim' domain
                ReputationService.recalculate_score(user_id, "claim")

            # 3. Update claim status
            supabase.table("claims").update({
                "status": resolution,
                "resolved_at": "now()"
            }).eq("id", claim_id).execute()

            logger.info(f"Settled claim {claim_id} with resolution {resolution}")

        except Exception as e:
            logger.error(f"Failed to settle claim: {str(e)}")

reputation_service = ReputationService()
