from __future__ import annotations

import os
from typing import TYPE_CHECKING

from langchain.chat_models import init_chat_model
from langgraph.graph import START, StateGraph

from .state import State

__all__ = ["graph"]

# ---------------------------------------------------------------------------
# LLM setup
# ---------------------------------------------------------------------------
# Users can set any supported model via the environment variable AGENT_MODEL.
# Defaults to OpenAI GPT-4o-mini which supports tool calling and streaming.
# See: https://langchain-ai.github.io/langgraph/tutorials/get-started/1-build-basic-chatbot/
# noqa: E501  # link reference
model_id = os.getenv("AGENT_MODEL", "openai:gpt-4o-mini")
llm = init_chat_model(model_id)


# ---------------------------------------------------------------------------
# Node definitions
# ---------------------------------------------------------------------------

def chatbot(state: State):  # noqa: D401, D403 (simple function, docstring is fine)
    """
    LLM-only response node.

    Takes the running `state`, invokes the underlying chat model with the full
    message history, and returns an updated messages list containing the new
    assistant reply. The use of `add_messages` in the State schema ensures the
    list is appended rather than overwritten.
    """

    return {"messages": [llm.invoke(state["messages"])]}


# ---------------------------------------------------------------------------
# Graph assembly & compilation
# ---------------------------------------------------------------------------

graph_builder = StateGraph(State)

# Register the single node and the entry edge from START.
graph_builder.add_node("chatbot", chatbot)
graph_builder.add_edge(START, "chatbot")

# Finalize the graph so callers can invoke or stream it.
graph = graph_builder.compile()
