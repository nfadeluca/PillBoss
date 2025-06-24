"""
Quick CLI for interacting with the LangGraph chatbot.

Run with:
    python -m backend.agents.run_agent

Environment variables:
    OPENAI_API_KEY / ANTHROPIC_API_KEY etc.  - your model provider credentials.
    AGENT_MODEL                              - override default model.
"""

from __future__ import annotations

from contextlib import suppress

from agents.graph import graph

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def stream_chat(user_input: str) -> None:
    """Stream assistant updates to stdout until graph completes."""

    for event in graph.stream({"messages": [{"role": "user", "content": user_input}]}):
        with suppress(KeyError):
            # Each event is a mapping of node names -> state deltas.
            for value in event.values():
                # Grab the newest message. LangChain returns ChatMessage
                # objects (AIMessage/HumanMessage). We assume that here.
                message = value["messages"][-1]

                content = getattr(message, "content", None)
                if content is not None:
                    print(f"Assistant: {content}")
                    continue


# ---------------------------------------------------------------------------
# Main REPL loop
# ---------------------------------------------------------------------------

def main() -> None:
    print("LangGraph agent CLI. Type 'exit' or 'quit' to leave.\n")
    while True:
        try:
            user_input = input("User: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nGoodbye!")
            break

        if user_input.lower() in {"quit", "exit", "q"}:
            print("Goodbye!")
            break

        if user_input:
            stream_chat(user_input)


if __name__ == "__main__":
    main()
