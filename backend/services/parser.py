"""
Document parser service.

Responsibilities:
    - Validate file type and size (security gate)
    - Extract plain text from PDF, DOCX, or TXT uploads
    - Return structured metadata (char count, page count)
    - Raise clear, user-facing errors for bad uploads

Never logs the full document content.
"""

from __future__ import annotations

import io
import logging
from dataclasses import dataclass

import pdfplumber
from docx import Document as DocxDocument
from fastapi import UploadFile, HTTPException, status

logger = logging.getLogger(__name__)

# Allowed MIME types for upload
ALLOWED_MIME_TYPES: set[str] = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    # Some browsers send these for .txt files
    "application/octet-stream",
}

# Minimum extractable text to be considered a valid document
MIN_CHAR_COUNT = 100


@dataclass
class ParsedDocument:
    text: str
    filename: str
    char_count: int
    page_count: int  # 0 for non-PDF/DOCX files


async def parse_upload(file: UploadFile, max_bytes: int) -> ParsedDocument:
    """
    Read, validate, and extract text from an uploaded file.

    Raises HTTPException with a clear user-facing message for:
        - Wrong file type
        - File too large
        - Empty or unreadable file (e.g. scanned image PDF)
    """
    # --- Size guard: read up to max_bytes + 1 to detect oversize ---
    raw = await file.read(max_bytes + 1)
    if len(raw) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds the {max_bytes // (1024 * 1024)} MB size limit.",
        )

    # --- MIME type guard ---
    content_type = (file.content_type or "").lower().split(";")[0].strip()
    filename = file.filename or "document"
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if content_type not in ALLOWED_MIME_TYPES and extension not in {"pdf", "docx", "txt"}:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                "Unsupported file type. Please upload a PDF, DOCX, or plain-text (.txt) file."
            ),
        )

    # --- Dispatch to type-specific extractor ---
    if extension == "pdf" or content_type == "application/pdf":
        text, page_count = _extract_pdf(raw, filename)
    elif extension == "docx" or "wordprocessingml" in content_type:
        text, page_count = _extract_docx(raw, filename)
    else:
        text, page_count = _extract_txt(raw, filename)

    # --- Empty / scanned-image guard ---
    if len(text.strip()) < MIN_CHAR_COUNT:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "We couldn't extract readable text from this file. "
                "It may be a scanned image, password-protected, or empty. "
                "Please upload a text-based PDF, DOCX, or TXT file."
            ),
        )

    # Log only metadata, never content
    logger.info(
        "Parsed document: filename=%s chars=%d pages=%d",
        filename,
        len(text),
        page_count,
    )

    return ParsedDocument(
        text=text,
        filename=filename,
        char_count=len(text),
        page_count=page_count,
    )


def _extract_pdf(raw: bytes, filename: str) -> tuple[str, int]:
    """Extract text from a PDF byte string using pdfplumber."""
    try:
        with pdfplumber.open(io.BytesIO(raw)) as pdf:
            pages = pdf.pages
            page_count = len(pages)
            parts: list[str] = []
            for page in pages:
                page_text = page.extract_text()
                if page_text:
                    parts.append(page_text)
            return "\n".join(parts), page_count
    except Exception as exc:
        logger.warning("PDF extraction failed for %s: %s", filename, type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not read this PDF. It may be corrupted or password-protected.",
        ) from exc


def _extract_docx(raw: bytes, filename: str) -> tuple[str, int]:
    """Extract text from a DOCX byte string using python-docx."""
    try:
        doc = DocxDocument(io.BytesIO(raw))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        text = "\n".join(paragraphs)
        # DOCX has no reliable page count without rendering; use paragraph count as proxy
        return text, 0
    except Exception as exc:
        logger.warning("DOCX extraction failed for %s: %s", filename, type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not read this DOCX file. It may be corrupted.",
        ) from exc


def _extract_txt(raw: bytes, filename: str) -> tuple[str, int]:
    """Decode a plain-text file, trying UTF-8 then Latin-1 as fallback."""
    for encoding in ("utf-8", "latin-1"):
        try:
            return raw.decode(encoding), 0
        except UnicodeDecodeError:
            continue
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail="Could not decode this text file. Please ensure it is UTF-8 encoded.",
    )
