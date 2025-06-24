"""
Domain logic for MCP tools used by the patient server.

This module isolates core functionality so that it can be imported by
`server.py` (or unit-tests) without coupling the logic to the FastMCP server
instance.  Each function here is **pure business logic** — registration with
FastMCP happens in `server.py`.
"""

from typing import Final


PATIENTS: Final[list[dict[str, str]]] = [
    {"id": "p1", "name": "Alice Smith"},
    {"id": "p2", "name": "Bob Johnson"},
    {"id": "p3", "name": "Carol Williams"},
]


def list_patients() -> list[dict[str, str]]:
    """Return a hard-coded list of the current patients.

    In a real system this would query a database or service. For now we
    simply return a static list so that the FastMCP demo has predictable
    output.

    Returns
    -------
    list[dict[str, str]]
        Each element contains an ``id`` and ``name`` key identifying a patient.
    """

    # The slice copy guards against callers mutating our module-level constant.
    return PATIENTS.copy()
