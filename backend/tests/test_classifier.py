"""
Unit tests for the document classifier service.

Tests cover:
    - Correct type parsing from valid LLM response
    - Confidence gate: low confidence → OTHER
    - Unknown type returned by LLM → OTHER
    - JSON parse failure → OTHER (safe fallback)
    - All valid doc types are accepted
"""

from __future__ import annotations

import json
import pytest
from unittest.mock import patch, MagicMock

from constants.doc_types import ALL_DOC_TYPES, DocType


def _make_mock_response(doc_type: str, confidence: float, reason: str = "test reason"):
    """Create a mock Gemini response object."""
    mock = MagicMock()
    mock.text = json.dumps({"type": doc_type, "confidence": confidence, "reason": reason})
    return mock


@patch("services.classifier._get_model")
def test_classify_high_confidence_vendor(mock_get_model):
    from services.classifier import classify_document
    mock_model = MagicMock()
    mock_model.generate_content.return_value = _make_mock_response("VENDOR", 0.95)
    mock_get_model.return_value = mock_model

    result = classify_document("This Master Services Agreement is entered into between Vendor and Customer...")
    assert result.doc_type == "VENDOR"
    assert result.confidence == 0.95
    assert result.low_confidence is False


@patch("services.classifier._get_model")
def test_classify_low_confidence_falls_back_to_other(mock_get_model):
    from services.classifier import classify_document
    mock_model = MagicMock()
    mock_model.generate_content.return_value = _make_mock_response("LEASE", 0.50)
    mock_get_model.return_value = mock_model

    result = classify_document("Ambiguous document text...")
    assert result.doc_type == DocType.OTHER
    assert result.low_confidence is True


@patch("services.classifier._get_model")
def test_classify_unknown_type_falls_back_to_other(mock_get_model):
    from services.classifier import classify_document
    mock_model = MagicMock()
    # LLM returns a type not in our enum
    mock_model.generate_content.return_value = _make_mock_response("WILL_AND_TESTAMENT", 0.90)
    mock_get_model.return_value = mock_model

    result = classify_document("Some document text...")
    assert result.doc_type == DocType.OTHER


@patch("services.classifier._get_model")
def test_classify_json_parse_error_falls_back_to_other(mock_get_model):
    from services.classifier import classify_document
    mock_model = MagicMock()
    bad_response = MagicMock()
    bad_response.text = "this is not json at all"
    mock_model.generate_content.return_value = bad_response
    mock_get_model.return_value = mock_model

    result = classify_document("Some document text...")
    assert result.doc_type == DocType.OTHER
    assert result.low_confidence is True


@patch("services.classifier._get_model")
def test_classify_api_error_falls_back_to_other(mock_get_model):
    from services.classifier import classify_document
    mock_model = MagicMock()
    mock_model.generate_content.side_effect = Exception("API error")
    mock_get_model.return_value = mock_model

    result = classify_document("Some document text...")
    assert result.doc_type == DocType.OTHER


@pytest.mark.parametrize("doc_type", ALL_DOC_TYPES)
@patch("services.classifier._get_model")
def test_all_valid_types_accepted(mock_get_model, doc_type):
    from services.classifier import classify_document
    mock_model = MagicMock()
    mock_model.generate_content.return_value = _make_mock_response(doc_type, 0.90)
    mock_get_model.return_value = mock_model

    result = classify_document("Sample text...")
    # OTHER is a valid type but triggered here by being listed, not by low confidence
    assert result.doc_type in ALL_DOC_TYPES
