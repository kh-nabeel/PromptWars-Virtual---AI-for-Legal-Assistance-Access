"""
Chat service — grounded Q&A over the uploaded document(s).

Key invariants:
    - Answers ONLY from the document text stored in the session cache.
    - If the answer is not in the document, says so plainly.
    - Never guesses, never presents answers as legal advice.
    - Never re-sends the full document on every turn (uses session cache).
"""

from __future__ import annotations

import logging

import google.generativeai as genai

from config import get_settings
from models import ChatResponse

logger = logging.getLogger(__name__)

# Max characters of document context sent per chat turn
CHAT_CONTEXT_LIMIT = 24_000

GROUNDING_PREAMBLE = """You are a legal document assistant helping a user understand their document.

STRICT RULES:
1. Answer ONLY using information explicitly found in the document excerpt below.
2. If the answer is not in the document, say exactly: "I couldn't find information about that in this document."
3. Never guess, infer, or use outside knowledge.
4. Never present your answer as legal advice. Do not say "you should" or make recommendations.
5. Keep answers concise and in plain language (8th-grade reading level).
6. If the user asks about a second document, compare only using what is in both excerpts.

"""


def _get_model() -> genai.GenerativeModel:
    settings = get_settings()
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(settings.gemini_model)


def answer_question(
    question: str,
    doc_text: str,
    doc_type: str,
    doc_text_b: str | None = None,
) -> ChatResponse:
    """
    Answer a user question grounded only in the provided document text(s).

    The full document is NOT re-sent per turn — callers pass the cached
    text from the session store.
    """
    excerpt_a = doc_text[:CHAT_CONTEXT_LIMIT]
    context = f"DOCUMENT ({doc_type}):\n{excerpt_a}"

    if doc_text_b:
        excerpt_b = doc_text_b[: CHAT_CONTEXT_LIMIT // 2]
        context += f"\n\nSECOND DOCUMENT ({doc_type}):\n{excerpt_b}"

    prompt = f"""{GROUNDING_PREAMBLE}{context}

USER QUESTION: {question}

Answer:"""

    try:
        model = _get_model()
        response = model.generate_content(prompt)
        answer = response.text.strip()

        # Heuristic: if the model says it couldn't find info, flag it
        not_found_phrases = [
            "couldn't find",
            "not in the document",
            "not mentioned",
            "not found",
            "does not appear",
        ]
        found_in_document = not any(p in answer.lower() for p in not_found_phrases)

        return ChatResponse(answer=answer, found_in_document=found_in_document)

    except Exception as exc:
        logger.warning("Chat failed (%s).", type(exc).__name__)
        return ChatResponse(
            answer="I was unable to process your question. Please try again.",
            found_in_document=False,
        )
