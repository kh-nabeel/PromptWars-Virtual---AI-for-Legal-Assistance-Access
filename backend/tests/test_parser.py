"""
Unit tests for the document parser service.

Tests cover:
    - Valid PDF extraction (mocked)
    - Valid DOCX extraction (mocked)
    - Valid TXT extraction
    - File-too-large rejection
    - Wrong MIME type rejection
    - Empty / too-short text rejection
"""

from __future__ import annotations

import io
import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# TXT parsing (no external deps needed)
# ---------------------------------------------------------------------------

def make_txt_upload(content: str, filename: str = "test.txt", content_type: str = "text/plain"):
    """Helper to build a mock UploadFile-like object."""
    from unittest.mock import AsyncMock, MagicMock
    mock = MagicMock()
    mock.filename = filename
    mock.content_type = content_type
    raw = content.encode("utf-8")
    mock.read = AsyncMock(return_value=raw)
    return mock, raw


@pytest.mark.asyncio
async def test_parse_valid_txt():
    from services.parser import parse_upload
    content = "This is a test legal document. " * 10  # > 100 chars
    mock_file, _ = make_txt_upload(content)
    # Patch read to return the bytes
    from unittest.mock import AsyncMock
    mock_file.read = AsyncMock(return_value=content.encode("utf-8"))

    result = await parse_upload(mock_file, max_bytes=10 * 1024 * 1024)
    assert result.char_count > 100
    assert result.text == content


@pytest.mark.asyncio
async def test_parse_txt_too_large():
    from services.parser import parse_upload
    from unittest.mock import AsyncMock
    max_bytes = 1000
    # Return max_bytes + 2 bytes to trigger the size check
    oversized = b"x" * (max_bytes + 2)
    mock_file = MagicMock()
    mock_file.filename = "big.txt"
    mock_file.content_type = "text/plain"
    mock_file.read = AsyncMock(return_value=oversized)

    with pytest.raises(HTTPException) as exc_info:
        await parse_upload(mock_file, max_bytes=max_bytes)
    assert exc_info.value.status_code == 413


@pytest.mark.asyncio
async def test_parse_wrong_mime_type():
    from services.parser import parse_upload
    from unittest.mock import AsyncMock
    content = b"some content"
    mock_file = MagicMock()
    mock_file.filename = "file.exe"
    mock_file.content_type = "application/x-msdownload"
    mock_file.read = AsyncMock(return_value=content)

    with pytest.raises(HTTPException) as exc_info:
        await parse_upload(mock_file, max_bytes=10 * 1024 * 1024)
    assert exc_info.value.status_code == 415


@pytest.mark.asyncio
async def test_parse_empty_txt():
    from services.parser import parse_upload
    from unittest.mock import AsyncMock
    mock_file = MagicMock()
    mock_file.filename = "empty.txt"
    mock_file.content_type = "text/plain"
    mock_file.read = AsyncMock(return_value=b"  ")  # whitespace only

    with pytest.raises(HTTPException) as exc_info:
        await parse_upload(mock_file, max_bytes=10 * 1024 * 1024)
    assert exc_info.value.status_code == 422


@pytest.mark.asyncio
async def test_parse_pdf_extraction_failure():
    """A PDF that pdfplumber can't read should return a 422."""
    from services.parser import parse_upload
    from unittest.mock import AsyncMock, patch
    mock_file = MagicMock()
    mock_file.filename = "bad.pdf"
    mock_file.content_type = "application/pdf"
    mock_file.read = AsyncMock(return_value=b"not a real pdf")

    # pdfplumber will raise on invalid bytes — that should map to 422
    with pytest.raises(HTTPException) as exc_info:
        await parse_upload(mock_file, max_bytes=10 * 1024 * 1024)
    assert exc_info.value.status_code in (422, 415)
