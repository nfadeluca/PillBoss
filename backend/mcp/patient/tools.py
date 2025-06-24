"""
Domain logic for MCP tools used by the patient server.

This module isolates core functionality so that it can be imported by
`server.py` (or unit-tests) without coupling the logic to the FastMCP server
instance.  Each function here is **pure business logic** — registration with
FastMCP happens in `server.py`.
"""

from typing import Final


def get_optimal_dose(medication: str) -> str:
    """Return the recommended default dose for *medication*.

    The implementation is intentionally minimal for demonstration purposes.  A
    small lookup table is used for a few common medications; unknown inputs
    fall back to a generic recommendation so the tool always returns a value.

    Parameters
    ----------
    medication:
        The name of the medication (case-insensitive).

    Returns
    -------
    str
        A human-readable default dose (e.g., "325 mg once daily").
    """

    MED_DEFAULTS: Final[dict[str, str]] = {
        "aspirin": "325 mg once daily",
        "ibuprofen": "400 mg every 6 hours as needed (maximum 2400 mg/day)",
        "acetaminophen": "500 mg every 6 hours as needed (maximum 3000 mg/day)",
    }

    normalized = medication.lower().strip()

    # Attempt lookup; use fallback if not present.
    return MED_DEFAULTS.get(normalized, "1 tablet once daily (default demo value)")
