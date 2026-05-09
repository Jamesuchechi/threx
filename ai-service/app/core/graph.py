import os
from neo4j import GraphDatabase
from typing import List, Dict, Any
from loguru import logger

class GraphService:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI", "bolt://localhost:7687"),
            auth=(os.getenv("NEO4J_USER", "neo4j"), os.getenv("NEO4J_PASSWORD", "password"))
        )

    def close(self):
        self.driver.close()

    def create_node(self, node_id: str, title: str, node_type: str):
        with self.driver.session() as session:
            session.execute_write(self._create_node_tx, node_id, title, node_type)

    @staticmethod
    def _create_node_tx(tx, node_id, title, node_type):
        query = (
            "MERGE (n:Node {id: $id}) "
            "SET n.title = $title, n.type = $type "
            "RETURN n"
        )
        tx.run(query, id=node_id, title=title, type=node_type)

    def create_connection(self, from_id: str, to_id: str, reason: str, score: float):
        with self.driver.session() as session:
            session.execute_write(self._create_connection_tx, from_id, to_id, reason, score)

    @staticmethod
    def _create_connection_tx(tx, from_id, to_id, reason, score):
        query = (
            "MATCH (a:Node {id: $from_id}), (b:Node {id: $to_id}) "
            "MERGE (a)-[r:CONNECTS_TO {reason: $reason, score: $score}]->(b) "
            "RETURN r"
        )
        tx.run(query, from_id=from_id, to_id=to_id, reason=reason, score=score)

    def get_connections(self, node_id: str) -> List[Dict[str, Any]]:
        with self.driver.session() as session:
            return session.execute_read(self._get_connections_tx, node_id)

    @staticmethod
    def _get_connections_tx(tx, node_id):
        query = (
            "MATCH (n:Node {id: $id})-[r:CONNECTS_TO]-(neighbor:Node) "
            "RETURN neighbor.id as id, neighbor.title as title, neighbor.type as type, r.reason as reason, r.score as score "
            "ORDER BY r.score DESC"
        )
        result = tx.run(query, id=node_id)
        return [record.data() for record in result]

graph_service = GraphService()
