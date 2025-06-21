from fastapi import APIRouter
from pydantic import BaseModel, Field

from agents.graph import graph

router = APIRouter(prefix="/agent", tags=["agent"])


class ChatRequest(BaseModel):
    message: str = Field(..., description="User's chat message")


class ChatResponse(BaseModel):
    response: str = Field(..., description="Assistant's reply")


@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(payload: ChatRequest) -> ChatResponse:
    """Send a single message to the LangGraph agent and return its reply."""

    # Invoke the compiled graph synchronously with one-user message.
    result = graph.invoke({"messages": [{"role": "user", "content": payload.message}]})

    # The assistant's response is the last item in the messages list.
    assistant_msg = result["messages"][-1]
    return ChatResponse(response=getattr(assistant_msg, "content", str(assistant_msg)))
