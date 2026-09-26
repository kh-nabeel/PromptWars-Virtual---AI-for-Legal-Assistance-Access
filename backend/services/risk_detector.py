"""
Risk detector service.

For each document type, asks Gemini to evaluate ONLY the risk items
defined in the type-specific taxonomy (constants/risk_taxonomies.py).
This is what makes the risk analysis "smart" — a lease is checked for
auto-renewal and entry rights, a ToS is checked for data-sharing and
arbitration waivers, etc.
"""

from __future__ import annotations

import json
import logging
import re

import google.generativeai as genai

from config import get_settings
from constants.risk_taxonomies import RISK_TAXONOMIES
from models import RiskItem, RiskResponse

logger = logging.getLogger(__name__)

RISK_TEXT_LIMIT = 32_000


def _get_model() -> genai.GenerativeModel:
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(settings.gemini_model)


def detect_risks(session_id: str, text: str, doc_type: str) -> RiskResponse:
    """
    Evaluate the document against the type-specific risk taxonomy.

    For each risk item, the LLM indicates whether it was found, provides
    a supporting excerpt, and assigns a severity (LOW/MEDIUM/HIGH).
    If no HIGH/MEDIUM risks are found, no_risks_found is set to True.
    """
    taxonomy = RISK_TAXONOMIES.get(doc_type, RISK_TAXONOMIES["OTHER"])
    excerpt = text[:RISK_TEXT_LIMIT]

    # Build a compact, structured description of each risk item for the prompt
    risk_descriptions = json.dumps(
        [
            {
                "id": item["id"],
                "label": item["label"],
                "description": item["description"],
                "default_severity": item["severity_hint"],
            }
            for item in taxonomy
        ],
        indent=2,
    )

    prompt = f"""You are a legal risk analyst reviewing a {doc_type} document on behalf of an everyday person.

For each risk item below, determine:
1. Whether this risk is present in the document (found: true/false)
2. If found, a SHORT verbatim excerpt (max 200 chars) that supports the finding
3. The actual severity based on the specific language: LOW, MEDIUM, or HIGH
4. A plain-language explanation (1-2 sentences) of why this matters for THIS document

If a risk is NOT found, set found=false and leave excerpt null.
If no risks are found at all, still return all items with found=false.
Do NOT invent risks that are not supported by the document text.

Risk items to evaluate:
{risk_descriptions}

Respond with ONLY valid JSON (no markdown):
{{
  "items": [
    {{
      "id": "<id>",
      "label": "<label>",
      "severity": "LOW|MEDIUM|HIGH",
      "found": true|false,
      "excerpt": "<verbatim quote or null>",
      "plain_reason": "<plain explanation>"
    }},
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
        items = [RiskItem(**item) for item in data["items"]]
    except Exception as exc:
        logger.warning("Risk detection failed (%s). Returning fallback.", type(exc).__name__)
        # Return all items from taxonomy as "not evaluated" rather than crashing
        items = [
            RiskItem(
                id=item["id"],
                label=item["label"],
                severity=item["severity_hint"],
                found=False,
                excerpt=None,
                plain_reason="Risk analysis could not be completed for this item.",
            )
            for item in taxonomy
        ]

    # Determine if any meaningful risks were found
    meaningful_risks = [i for i in items if i.found and i.severity in ("MEDIUM", "HIGH")]
    no_risks_found = len(meaningful_risks) == 0

    return RiskResponse(
        session_id=session_id,
        doc_type=doc_type,
        items=items,
        no_risks_found=no_risks_found,
    )
