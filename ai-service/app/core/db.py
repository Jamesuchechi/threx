import os
from supabase import create_client, Client

url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

supabase = None

if url and key:
    try:
        supabase = create_client(url, key)
    except Exception as e:
        print(f"Warning: Supabase client could not be initialized: {e}")
else:
    print("Warning: Supabase environment variables are missing.")

def update_node_longevity(node_id: str, score: float, band: str, reasoning: str):
    if not supabase:
        print(f"Error: Supabase not initialized. Skipping update for {node_id}")
        return
    try:
        supabase.table("nodes").update({
            "longevity_score": score,
            "longevity_band": band,
            "longevity_reasoning": reasoning
        }).eq("id", node_id).execute()
    except Exception as e:
        print(f"Error updating node longevity: {e}")
