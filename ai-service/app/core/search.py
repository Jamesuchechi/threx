import os
from typing import List, Dict, Any
from pinecone import Pinecone, ServerlessSpec
from openai import OpenAI
from loguru import logger

class SearchService:
    def __init__(self):
        self.pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        self.openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.index_name = "threx-nodes"
        
        # Ensure index exists
        if self.index_name not in self.pc.list_indexes().names():
            logger.info(f"Creating Pinecone index: {self.index_name}")
            self.pc.create_index(
                name=self.index_name,
                dimension=1536, # OpenAI text-embedding-3-small
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
        self.index = self.pc.Index(self.index_name)

    def generate_embedding(self, text: str) -> List[float]:
        response = self.openai.embeddings.create(
            input=text,
            model="text-embedding-3-small"
        )
        return response.data[0].embedding

    def upsert_node(self, node_id: str, content: str, metadata: Dict[str, Any]):
        embedding = self.generate_embedding(content)
        self.index.upsert(
            vectors=[(node_id, embedding, metadata)]
        )
        logger.info(f"Upserted node {node_id} to Pinecone")

    def semantic_search(self, query: str, limit: int = 10, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        query_embedding = self.generate_embedding(query)
        results = self.index.query(
            vector=query_embedding,
            top_k=limit,
            filter=filters,
            include_metadata=True
        )
        
        return [
            {
                "id": match["id"],
                "score": match["score"],
                "metadata": match["metadata"]
            }
            for match in results["matches"]
        ]

search_service = SearchService()
