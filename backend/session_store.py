"""
Session store — in-memory cache keyed by session_id (UUID string).

Stores the parsed document text and all derived analysis results so that
subsequent requests (chat, export, etc.) never re-send the full document
to the LLM. Sessions are stored until the process restarts (MVP-grade).

Structure per session:
    {
        "text":           str,   # full extracted plain text
        "filename":       str,
        "doc_type":       str,   # confirmed doc type (after any user correction)
        "classification": dict,  # raw ClassificationResult data
        "summary":        dict | None,
        "risks":          dict | None,
    }
"""

from __future__ import annotations

_store: dict[str, dict] = {}


def create_session(session_id: str, data: dict) -> None:
    """Create a new session entry."""
    _store[session_id] = data


def get_session(session_id: str) -> dict | None:
    """Return session data or None if not found."""
    return _store.get(session_id)


def update_session(session_id: str, updates: dict) -> bool:
    """Merge updates into an existing session. Returns False if not found."""
    if session_id not in _store:
        return False
    _store[session_id].update(updates)
    return True


def delete_session(session_id: str) -> None:
    """Remove a session (e.g. after export or on error)."""
    _store.pop(session_id, None)


def session_exists(session_id: str) -> bool:
    return session_id in _store
