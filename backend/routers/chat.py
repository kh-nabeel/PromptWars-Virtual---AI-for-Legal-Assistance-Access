"""
Chat router — POST /api/chat

Routes user questions to the grounded chat service.
Document text is retrieved from the session cache — not re-sent by the client.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from models import ChatRequest, ChatResponse
from services.chat import answer_question
import session_store

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest) -> ChatResponse:
    session = session_store.get_session(body.session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found. Please upload a document first.",
        )

    # Retrieve second document text if provided
    doc_text_b: str | None = None
    if body.session_id_b:
        session_b = session_store.get_session(body.session_id_b)
        if session_b:
            doc_text_b = session_b["text"]

    return answer_question(
        question=body.message,
        doc_text=session["text"],
        doc_type=session["doc_type"],
        doc_text_b=doc_text_b,
    )
