"""
Upload router — POST /api/upload

1. Validates and parses the uploaded file
2. Classifies the document type
3. Creates a session entry caching text + classification
4. Returns session_id, filename, and classification result

The response does NOT include the document text — that stays server-side.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, File, UploadFile, Depends

from config import get_settings, Settings
from models import UploadResponse
from services.parser import parse_upload
from services.classifier import classify_document
import session_store

router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
) -> UploadResponse:
    # Parse and validate the uploaded file
    parsed = await parse_upload(file, settings.max_upload_bytes)

    # Classify the document type
    classification = classify_document(parsed.text)

    # Store session (text cached server-side, never returned to client)
    session_id = str(uuid.uuid4())
    session_store.create_session(
        session_id,
        {
            "text": parsed.text,
            "filename": parsed.filename,
            "doc_type": classification.doc_type,
            "classification": classification.model_dump(),
            "summary": None,
            "risks": None,
        },
    )

    return UploadResponse(
        session_id=session_id,
        filename=parsed.filename,
        char_count=parsed.char_count,
        classification=classification,
        text=parsed.text,
    )
