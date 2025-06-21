from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
import json
import asyncio

from agents.graph import graph

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/")
async def chat_endpoint(request: Request):
    """Stream the assistant reply in the DataStream format expected by assistant-ui."""

    data = await request.json()

    # Extract the newest user message from the array sent by assistant-ui
    messages = data.get("messages", [])
    user_message = next(
        (m for m in reversed(messages) if m.get("role") == "user"),
        {"content": ""},
    )

    # 1. Run the LangGraph agent to get the final assistant message (blocking call)
    result = graph.invoke({"messages": [{"role": "user", "content": user_message.get("content", "")}]})
    assistant_msg = result["messages"][-1]
    full_text = getattr(assistant_msg, "content", str(assistant_msg))

    # 2. Generator that yields DataStream chunks (type "0" => TextDelta, type "d" => FinishMessage)
    async def data_stream():
        # Stream each character; change to words/tokens if desired
        for char in full_text:
            chunk = {"type": "0", "value": char}
            yield (json.dumps(chunk) + "\n").encode()
            await asyncio.sleep(0)  # yield control to event loop

        finish_chunk = {
            "type": "d",
            "value": {
                "finishReason": "stop",
                "usage": {"promptTokens": 0, "completionTokens": 0},
            },
        }
        yield (json.dumps(finish_chunk) + "\n").encode()

    headers = {"x-vercel-ai-data-stream": "v1"}
    return StreamingResponse(
        data_stream(), media_type="text/plain; charset=utf-8", headers=headers
    )
