"""
Document comparison service.

Compares two documents of the SAME type, identifying what changed
and whether those changes are better or worse for the user.
Only invoked when both sessions have the same doc_type.
"""

from __future__ import annotations

import json
import logging
import re

import google.generativeai as genai

from config import get_settings
from constants.summary_sections import SUMMARY_SECTIONS
from models import ComparisonDiff, CompareResponse

logger = logging.getLogger(__name__)

COMPARE_TEXT_LIMIT = 16_000  # per document


def _get_model() -> genai.GenerativeModel:
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(settings.gemini_model)


def compare_documents(
    session_id_a: str,
    text_a: str,
    session_id_b: str,
    text_b: str,
    doc_type: str,
) -> CompareResponse:
    """
    Compare two documents of the same type.

    Uses the type-specific section list to structure the comparison,
    so a lease comparison covers Rent, Duration, Termination — not
    generic fields that don't apply.
    """
    sections = SUMMARY_SECTIONS.get(doc_type, SUMMARY_SECTIONS["OTHER"])
    sections_json = json.dumps(sections)
    excerpt_a = text_a[:COMPARE_TEXT_LIMIT]
    excerpt_b = text_b[:COMPARE_TEXT_LIMIT]

    prompt = f"""You are a legal document analyst comparing two versions of a {doc_type} document.
Document A is the first/older document. Document B is the second/newer document.
You are explaining differences to an everyday person who wants to know what changed and whether it helps or hurts them.

Compare the documents across these sections: {sections_json}

For each section where something changed, produce a diff entry.
Verdicts:
  - BETTER  → the change in Document B is more favourable to the user
  - WORSE   → the change in Document B is less favourable to the user
  - NEUTRAL → changed but neither clearly better nor worse
  - UNCHANGED → no meaningful difference

Also provide an overall_verdict: "Document B is better for you", "Document B is worse for you", or "Mixed changes — review each section."

Respond with ONLY valid JSON (no markdown):
{{
  "diffs": [
    {{
      "section": "<section name>",
      "change_type": "ADDED|REMOVED|CHANGED|UNCHANGED",
      "doc_a_text": "<relevant text from doc A or null>",
      "doc_b_text": "<relevant text from doc B or null>",
      "verdict": "BETTER|WORSE|NEUTRAL|UNCHANGED",
      "explanation": "<plain-language explanation of the change and why it matters>"
    }}
  ],
  "overall_verdict": "<overall verdict string>"
}}

DOCUMENT A:
{excerpt_a}

---

DOCUMENT B:
{excerpt_b}
"""

    try:
        model = _get_model()
        response = model.generate_content(prompt)
        raw = response.text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        data = json.loads(raw)
        diffs = [ComparisonDiff(**d) for d in data["diffs"]]
        overall_verdict = data.get("overall_verdict", "Review individual sections for changes.")
    except Exception as exc:
        logger.warning("Comparison failed (%s). Returning fallback.", type(exc).__name__)
        diffs = []
        overall_verdict = "Comparison could not be completed. Please try again."

    return CompareResponse(
        session_id_a=session_id_a,
        session_id_b=session_id_b,
        doc_type=doc_type,
        diffs=diffs,
        overall_verdict=overall_verdict,
    )
