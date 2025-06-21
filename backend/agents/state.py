from typing import Annotated, List
from typing_extensions import TypedDict

from langgraph.graph.message import add_messages

__all__ = ["State"]


class State(TypedDict):
    """
    Schema for graph state.

    The single key `messages` follows the format expected by LangChain chat models.
    The `add_messages` reducer appends new messages to the running list instead of
    overwriting it - exactly as demonstrated in the LangGraph basic-chatbot tutorial.
    """

    messages: Annotated[List, add_messages] 
