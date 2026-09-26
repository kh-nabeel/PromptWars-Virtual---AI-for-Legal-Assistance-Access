"""
Comparison router — POST /api/compare

Accepts a second document upload and compares it to an existing session.
Comparison is only allowed when both documents have the same detected type.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, File, Form, UploadFile, HTTPException, status, Depends

from config import get_settings, Settings
from models import CompareResponse
from services.parser import parse_upload
from services.classifier import classify_document
from services.comparator import compare_documents
import session_store

router = APIRouter()


@router.post("/compare", response_model=CompareResponse)
async def compare(
    session_id_a: str = Form(...),
    file_b: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
) -> CompareResponse:
    # Retrieve the first document's session
    session_a = session_store.get_session(session_id_a)
    if not session_a:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="First document session not found. Upload it first.",
        )

    # Parse and classify the second document
    parsed_b = await parse_upload(file_b, settings.max_upload_bytes)
    classification_b = classify_document(parsed_b.text)

    # Type-gate: only compare documents of the same type
    if classification_b.doc_type != session_a["doc_type"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Document type mismatch: the first document is a "
                f"'{session_a['doc_type']}' and the second is a "
                f"'{classification_b.doc_type}'. "
                "Comparison is only available between documents of the same type."
            ),
        )

    # Store session for the second document so chat can reference it
    session_id_b = str(uuid.uuid4())
    session_store.create_session(
        session_id_b,
        {
            "text": parsed_b.text,
            "filename": parsed_b.filename,
            "doc_type": classification_b.doc_type,
            "classification": classification_b.model_dump(),
            "summary": None,
            "risks": None,
        },
    )

    result = compare_documents(
        session_id_a=session_id_a,
        text_a=session_a["text"],
        session_id_b=session_id_b,
        text_b=parsed_b.text,
        doc_type=session_a["doc_type"],
    )
    return result
