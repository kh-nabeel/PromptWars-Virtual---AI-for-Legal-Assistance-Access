"""
Document type classifier service.

Uses the first ~3,000 tokens of the document text to ask Gemini to
identify the document type. Applies a confidence gate: if confidence
is below the configured threshold, falls back to OTHER.
"""

from __future__ import annotations

import json
import logging
import re

import google.generativeai as genai

from config import get_settings
from constants.doc_types import ALL_DOC_TYPES, DOC_TYPE_LABELS, DocType
from models import ClassificationResult

logger = logging.getLogger(__name__)

# Approximate character budget for classification prompt (~3 000 tokens)
CLASSIFICATION_TEXT_LIMIT = 12_000


def _get_model() -> genai.GenerativeModel:
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(settings.gemini_model)


def classify_document(text: str) -> ClassificationResult:
    """
    Send the document excerpt to Gemini and parse the structured response.

    Falls back to OTHER when:
        - Gemini confidence < threshold
        - Gemini returns an unrecognised type
        - Any API or parse error occurs
    """
    settings = get_settings()
    excerpt = text[:CLASSIFICATION_TEXT_LIMIT]
    types_list = ", ".join(ALL_DOC_TYPES)

    prompt = f"""You are a legal document classifier. Analyse the following document excerpt and identify its type.

Choose EXACTLY ONE type from this list: {types_list}

Use OTHER only if the document does not fit any other category.

Respond with ONLY valid JSON (no markdown fences, no extra text):
{{
  "type": "<TYPE>",
  "confidence": <0.0-1.0>,
  "reason": "<one sentence explaining your choice>"
}}

DOCUMENT EXCERPT:
{excerpt}
"""

    try:
        model = _get_model()
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Strip any accidental markdown fences the model might add
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        data = json.loads(raw)
        doc_type_raw: str = data.get("type", "OTHER").upper()
        confidence: float = float(data.get("confidence", 0.0))
        reason: str = data.get("reason", "")

    except Exception as exc:
        # Any failure → safe fallback, log without content
        logger.warning("Classification failed (%s). Falling back to OTHER.", type(exc).__name__)
        doc_type_raw = "OTHER"
        confidence = 0.0
        reason = "Classification could not be completed."

    # Validate type is in our known set
    if doc_type_raw not in ALL_DOC_TYPES:
        logger.warning("Model returned unknown type '%s', falling back to OTHER.", doc_type_raw)
        doc_type_raw = DocType.OTHER

    threshold = settings.classification_confidence_threshold
    low_confidence = confidence < threshold

    if low_confidence:
        # Override to OTHER when the model itself isn't sure
        doc_type_raw = DocType.OTHER
        reason = (
            f"We couldn't confidently identify this document type "
            f"(confidence {confidence:.0%}). Falling back to generic analysis."
        )

    return ClassificationResult(
        doc_type=doc_type_raw,
        label=DOC_TYPE_LABELS[doc_type_raw],
        confidence=confidence,
        reason=reason,
        low_confidence=low_confidence,
    )
