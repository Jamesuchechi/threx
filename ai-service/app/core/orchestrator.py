from typing import Annotated, TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage
from .llm import get_llm, LLMConfig
import operator

class AgentState(TypedDict):
    messages: Annotated[List[BaseMessage], operator.add]
    config: LLMConfig
    output: str

def call_model(state: AgentState):
    llm = get_llm(state["config"])
    response = llm.invoke(state["messages"])
    return {"output": response.content}

def build_simple_graph():
    """
    Builds a simple LangGraph with retries handled by the runtime.
    """
    workflow = StateGraph(AgentState)
    
    workflow.add_node("model", call_model)
    workflow.set_entry_point("model")
    workflow.add_edge("model", END)
    
    return workflow.compile()

# Example usage:
# graph = build_simple_graph()
# result = graph.invoke({"messages": [HumanMessage(content="test")], "config": LLMConfig()})
