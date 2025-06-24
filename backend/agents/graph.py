from __future__ import annotations

import os

from langchain.chat_models import init_chat_model
from langchain_core.messages import HumanMessage

from .state import State

from langgraph.graph import START, StateGraph

# RAG helpers
from .rag_utils import is_med_query, retrieve_med_docs

__all__ = ["graph"]

# ---------------------------------------------------------------------------
# LLM setup
# ---------------------------------------------------------------------------
# Users can set any supported model via the environment variable AGENT_MODEL.
# Defaults to OpenAI GPT-4o-mini which supports tool calling and streaming.
# See: https://langchain-ai.github.io/langgraph/tutorials/get-started/1-build-basic-chatbot/
model_id = os.getenv("AGENT_MODEL", "openai:gpt-4o-mini")
llm = init_chat_model(model_id)

# ---------------------------------------------------------------------------
# Node definitions
# ---------------------------------------------------------------------------

def chatbot(state: State):
    """
    LLM-only response node.

    Takes the running `state`, invokes the underlying chat model with the full
    message history, and returns an updated messages list containing the new
    assistant reply. The use of `add_messages` in the State schema ensures the
    list is appended rather than overwritten.
    """

    return {"messages": [llm.invoke(state["messages"])]}

# 1. Routing helper ---------------------------------------------------------

def _route(state: State) -> str:
    """Decide whether to invoke the RAG pipeline or default chatbot.

    A *very* lightweight heuristic is applied: if the latest user message
    contains medication-related keywords (drug, dose, mg, etc.) we choose the
    RAG path. In production you might employ an LLM-based classifier or a
    structured intent router instead.
    """

    raw_text = _get_content(state["messages"][-1])

    branch = "rag_retrieve" if is_med_query(raw_text) else "chatbot"
    print(f"[Router] selected path: {branch}")
    return branch

# 2. Retrieval node ---------------------------------------------------------

def rag_retrieve(state: State):
    """Fetch medication snippets relevant to the current user question."""

    question = _get_content(state["messages"][-1])

    docs = retrieve_med_docs(question)

    # Concatenate docs for simple context injection. We also write it back to
    # the state (so downstream nodes can access it) *and* add a synthetic
    # tool/assistant message so that the full conversation history contains
    # the retrieved knowledge.

    context = "\n---\n".join(docs)

    return {
        "context": context,
    }

# 3. Answer-generation node -------------------------------------------------

def rag_answer(state: State):
    """Generate a final answer leveraging retrieved context."""

    # Robust extraction of the last user question.
    question = _get_content(state["messages"][-1])

    context = state.get("context", "") or ""

    prompt = (
        "You are a medication domain assistant. Answer the user's question "
        "ONLY with information found in the provided context. If the context "
        "does not contain an answer, respond with 'I don't know'. Keep the "
        "answer concise.\n\n"
        f"Context:\n{context}\n\nQuestion: {question}"
    )

    answer = llm.invoke([HumanMessage(content=prompt)])
    return {"messages": [answer]}

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _get_content(msg):
    """Return string content from LangChain Message or dict."""

    if hasattr(msg, "content"):
        return msg.content
    if isinstance(msg, dict):
        return msg.get("content", "")
    return str(msg)

# ---------------------------------------------------------------------------
# Graph assembly & compilation
# ---------------------------------------------------------------------------

graph_builder = StateGraph(State)

# Register nodes
graph_builder.add_node("chatbot", chatbot)
graph_builder.add_node("rag_retrieve", rag_retrieve)
graph_builder.add_node("rag_answer", rag_answer)

# Wiring: retrieval → answer, simple chat ends immediately.
graph_builder.add_edge("rag_retrieve", "rag_answer")

# Terminal edges
from langgraph.graph import END  # local import to avoid polluting top-level namespace

graph_builder.add_edge("rag_answer", END)
graph_builder.add_edge("chatbot", END)

# Conditional entry routing based on the user's message content.
graph_builder.add_conditional_edges(START, _route)

# Compile graph
graph = graph_builder.compile()
