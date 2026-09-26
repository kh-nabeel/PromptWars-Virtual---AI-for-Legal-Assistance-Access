"""
Export router — GET /api/export/{session_id}

Generates two type-specific lists from the risk findings already cached
in the session:
    1. "Before you sign" checklist
    2. "Questions for my lawyer"

Uses the cached risk data — no additional LLM call if risks are already computed.
"""

from __future__ import annotations

import logging
import json
import re

import google.generativeai as genai
from fastapi import APIRouter, HTTPException, status

from config import get_settings
from models import ExportResponse
import session_store

logger = logging.getLogger(__name__)
router = APIRouter()


def _get_model() -> genai.GenerativeModel:
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(settings.gemini_model)


@router.get("/export/{session_id}", response_model=ExportResponse)
async def export_checklist(session_id: str) -> ExportResponse:
    session = session_store.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found. Please upload and analyse a document first.",
        )

    risks_data = session.get("risks")
    if not risks_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Risk analysis not yet completed. Please load the Risk panel first.",
        )

    doc_type = session["doc_type"]
    found_risks = [r for r in risks_data["items"] if r["found"]]

    # Build checklist and lawyer questions from risk findings
    checklist, lawyer_questions = _generate_export_lists(doc_type, found_risks)

    return ExportResponse(
        session_id=session_id,
        doc_type=doc_type,
        checklist=checklist,
        lawyer_questions=lawyer_questions,
    )


def _generate_export_lists(
    doc_type: str, found_risks: list[dict]
) -> tuple[list[str], list[str]]:
    """
    Use Gemini to turn risk findings into actionable checklists.
    Falls back to template-based lists if LLM call fails.
    """
    if not found_risks:
        return (
            ["No specific risks were flagged for this document. Review it carefully before signing."],
            ["Ask your attorney to review this document before you sign."],
        )

    risks_summary = "\n".join(
        f"- [{r['severity']}] {r['label']}: {r['plain_reason']}" for r in found_risks
    )

    prompt = f"""You are helping an everyday person prepare to sign a {doc_type} document.
Based on these flagged risks, produce two lists:

1. "Before You Sign" checklist: practical things the person should verify or negotiate before signing.
2. "Questions for My Lawyer": specific questions to ask a licensed attorney.

Each list should have 3-8 items. Be concrete and actionable.
Do NOT give legal advice. Frame checklist items as "Check that..." or "Confirm that..."
Frame lawyer questions as actual questions.

Flagged risks:
{risks_summary}

Respond with ONLY valid JSON:
{{
  "checklist": ["item 1", "item 2", ...],
  "lawyer_questions": ["question 1", "question 2", ...]
}}"""

    try:
        model = _get_model()
        response = model.generate_content(prompt)
        raw = response.text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        data = json.loads(raw)
        return data["checklist"], data["lawyer_questions"]
    except Exception as exc:
        logger.warning("Export generation failed (%s). Using fallback.", type(exc).__name__)
        # Fallback: derive directly from risk items without LLM
        checklist = [
            f"Check that the {r['label'].lower()} terms are acceptable to you."
            for r in found_risks
        ]
        lawyer_questions = [
            f"Can you explain the {r['label'].lower()} clause and what it means for me?"
            for r in found_risks
        ]
        return checklist, lawyer_questions
