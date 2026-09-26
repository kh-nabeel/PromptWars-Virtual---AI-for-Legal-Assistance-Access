"""
Analysis router — GET /api/analysis/{session_id}

Returns the type-specific summary and risk findings for a session.
Results are cached in the session store on first call;
subsequent calls return the cached version without an LLM round-trip.

Also handles POST /api/correct-type to let users override the detected type.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from constants.doc_types import ALL_DOC_TYPES, DOC_TYPE_LABELS
from models import (
    SummaryResponse,
    RiskResponse,
    CorrectTypeRequest,
    CorrectTypeResponse,
)
from services.summarizer import summarize_document
from services.risk_detector import detect_risks
import session_store

router = APIRouter()


@router.get("/analysis/{session_id}/summary", response_model=SummaryResponse)
async def get_summary(session_id: str) -> SummaryResponse:
    session = _get_session_or_404(session_id)

    # Return cached result if available
    if session.get("summary"):
        return SummaryResponse(**session["summary"])

    summary = summarize_document(
        session_id=session_id,
        text=session["text"],
        doc_type=session["doc_type"],
    )
    # Cache the result
    session_store.update_session(session_id, {"summary": summary.model_dump()})
    return summary


@router.get("/analysis/{session_id}/risks", response_model=RiskResponse)
async def get_risks(session_id: str) -> RiskResponse:
    session = _get_session_or_404(session_id)

    # Return cached result if available
    if session.get("risks"):
        return RiskResponse(**session["risks"])

    risks = detect_risks(
        session_id=session_id,
        text=session["text"],
        doc_type=session["doc_type"],
    )
    session_store.update_session(session_id, {"risks": risks.model_dump()})
    return risks


@router.post("/correct-type", response_model=CorrectTypeResponse)
async def correct_type(body: CorrectTypeRequest) -> CorrectTypeResponse:
    """
    Allow the user to override the detected document type.
    Clears cached summary/risks so they will be regenerated with the new type.
    """
    session = _get_session_or_404(body.session_id)

    if body.corrected_type not in ALL_DOC_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid document type. Must be one of: {', '.join(ALL_DOC_TYPES)}",
        )

    # Update type and invalidate downstream caches
    session_store.update_session(
        body.session_id,
        {
            "doc_type": body.corrected_type,
            "summary": None,  # force regeneration
            "risks": None,
        },
    )

    return CorrectTypeResponse(
        session_id=body.session_id,
        doc_type=body.corrected_type,
        label=DOC_TYPE_LABELS[body.corrected_type],
        message="Document type updated. Summary and risk analysis will be regenerated.",
    )


def _get_session_or_404(session_id: str) -> dict:
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found. Please upload a document first.",
        )
    return session
