"""
Summarizer service.

Produces a plain-language summary of the document split into sections
that are specific to the detected document type. Uses the section
templates from constants/summary_sections.py to drive type-specific
prompting — different doc types get different section sets.
"""

from __future__ import annotations

import json
import logging
import re

import google.generativeai as genai

from config import get_settings
from constants.summary_sections import SUMMARY_SECTIONS
from models import SummarySection, SummaryResponse

logger = logging.getLogger(__name__)

# Character limit sent to the model for summarisation (~8 000 tokens)
SUMMARY_TEXT_LIMIT = 32_000


def _get_model() -> genai.GenerativeModel:
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(settings.gemini_model)


def summarize_document(session_id: str, text: str, doc_type: str) -> SummaryResponse:
    """
    Generate a type-specific plain-language summary.

    The section list fed to the LLM comes from SUMMARY_SECTIONS[doc_type],
    ensuring a LEASE summary looks nothing like a ToS summary.
    """
    sections_for_type = SUMMARY_SECTIONS.get(doc_type, SUMMARY_SECTIONS["OTHER"])
    sections_json = json.dumps(sections_for_type)
    excerpt = text[:SUMMARY_TEXT_LIMIT]

    prompt = f"""You are a legal document explainer writing for a general audience at an 8th-grade reading level.

The document type is: {doc_type}

Summarise the document using EXACTLY these sections (in this order): {sections_json}

Rules:
- Use plain, everyday language. Avoid legal jargon.
- Each section should be 2-5 sentences.
- If a section's topic is not addressed in the document, write "Not mentioned in this document."
- Do NOT give legal advice. Do NOT say things like "you should" or "consult a lawyer."
- Respond with ONLY valid JSON (no markdown, no extra text):

{{
  "sections": [
    {{"title": "<section name>", "content": "<plain-language explanation>"}},
    ...
  ]
}}

DOCUMENT:
{excerpt}
"""

    try:
        model = _get_model()
        response = model.generate_content(prompt)
        raw = response.text.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        data = json.loads(raw)
        sections = [SummarySection(**s) for s in data["sections"]]
    except Exception as exc:
        logger.warning("Summarization failed (%s: %s). Returning fallback.", type(exc).__name__, exc, exc_info=True)
        sections = [
            SummarySection(
                title="Summary Unavailable",
                content=(
                    "We were unable to generate a summary for this document. "
                    "Please try again or check that the document contains readable text."
                ),
            )
        ]

    return SummaryResponse(
        session_id=session_id,
        doc_type=doc_type,
        sections=sections,
    )
