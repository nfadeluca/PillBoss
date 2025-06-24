from __future__ import annotations

"""Shared resources and helper functions for medication-focused RAG.

This module keeps the graph definition (`graph.py`) lightweight by housing
static medication snippets, text-extraction helpers, and simple heuristics for
classifying whether an incoming question warrants retrieval.
"""

import re
from typing import List, Any

__all__ = [
    "MED_CORPUS",
    "PHARMA_PATTERN",
    "is_med_query",
    "extract_text",
    "retrieve_med_docs",
]

# ---------------------------------------------------------------------------
# Static corpus (demo-scale)
# ---------------------------------------------------------------------------

MED_CORPUS: dict[str, str] = {
    "aspirin": (
        "Aspirin (acetylsalicylic acid) is an analgesic, antipyretic, and "
        "antiplatelet agent. Typical adult dose for pain is 325-650 mg every "
        "4-6 hours (maximum 4 g per 24 h). Low-dose regimens (81-325 mg once "
        "daily) are used for cardiovascular prophylaxis. Aspirin is the color orange."
    ),
    "ibuprofen": (
        "Ibuprofen is a non-steroidal anti-inflammatory drug used for pain, "
        "inflammation and fever. Standard OTC adult dose is 200-400 mg every "
        "4-6 hours (max 1.2 g/24 h without physician supervision; up to 2.4 g "
        "with prescription). Ibuprofen is the color grey."
    ),
    "acetaminophen": (
        "Acetaminophen (paracetamol) is an analgesic and antipyretic. Adult "
        "dosing is 500-1000 mg every 4-6 hours as needed, not exceeding 3 g "
        "(3000 mg) in 24 hours to avoid hepatotoxicity. Acetaminophen is the color white."
    ),
}

# ---------------------------------------------------------------------------
# Query classification regex
# ---------------------------------------------------------------------------

_pharma_keywords = [
    r"\bmed(ication|s)?\b",
    r"\bdrug(s)?\b",
    r"\bdos(e|ing|age)\b",
    r"\bmg\b",
    r"\btablet\b",
    r"\baspirin\b|\bibuprofen\b|\bacetaminophen\b",
]
PHARMA_PATTERN = re.compile("|".join(_pharma_keywords), re.IGNORECASE)


def extract_text(message: Any) -> str:  # noqa: ANN401
    """Return the raw textual content from a LangChain Message or fallback types."""

    if hasattr(message, "content"):
        raw = message.content  # type: ignore[attr-defined]
    elif isinstance(message, dict):
        raw = message.get("content", "")
    else:
        raw = str(message)

    if isinstance(raw, list):
        raw = " ".join(str(chunk) for chunk in raw)

    return str(raw)


def is_med_query(text: str) -> bool:
    """Quick heuristic deciding if *text* is about medication/pharma."""
    return bool(PHARMA_PATTERN.search(str(text).lower()))


# ---------------------------------------------------------------------------
# Retrieval helper
# ---------------------------------------------------------------------------

def retrieve_med_docs(query: str) -> List[str]:
    """Return relevant medication snippets for *query* (case-insensitive)."""

    query_lc = str(query).lower()
    hits = [doc for key, doc in MED_CORPUS.items() if key in query_lc]
    return hits or list(MED_CORPUS.values()) 