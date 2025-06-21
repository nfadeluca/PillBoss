"""
LangGraph agents package.

This sub-package houses the State schema, graph definition,
and any helper utilities for running LangGraph-based agents.
"""

from importlib import import_module as _import_module
from pathlib import Path

# Lazy import conveniences so that users can do `from backend.agents import graph`.
_graph = None

# Attempt to load environment variables from a `.env` file at project root.
try:
    from dotenv import load_dotenv  # type: ignore
except ModuleNotFoundError:
    # Not a hard requirement—skip if library isn't installed.
    load_dotenv = None  # type: ignore

if load_dotenv is not None:
    # Resolve repo root (two levels up from this file: backend/agents/__init__.py).
    repo_root = Path(__file__).resolve().parents[2]
    env_path = repo_root / ".env"
    load_dotenv(env_path, override=False)  # don't overwrite real env vars


def __getattr__(name):
    global _graph
    if name == "graph":
        if _graph is None:
            _graph = _import_module("backend.agents.graph").graph
        return _graph
    raise AttributeError(name) 
