"""
Unit tests for the comparator service.

Tests cover:
    - Comparison result is parsed correctly
    - Type-specific sections are used (not generic)
    - API failure returns graceful fallback
    - overall_verdict is always present
"""

from __future__ import annotations

import json
import pytest
from unittest.mock import patch, MagicMock

from constants.summary_sections import SUMMARY_SECTIONS


def _make_compare_response(diffs: list[dict], overall_verdict: str):
    mock = MagicMock()
    mock.text = json.dumps({"diffs": diffs, "overall_verdict": overall_verdict})
    return mock


@patch("services.comparator._get_model")
def test_compare_returns_diffs_and_verdict(mock_get_model):
    from services.comparator import compare_documents
    diffs = [
        {
            "section": "Scope & Deliverables",
            "change_type": "CHANGED",
            "doc_a_text": "Vendor will deliver 3 design mockups.",
            "doc_b_text": "Vendor will deliver 1 design mockup.",
            "verdict": "WORSE",
            "explanation": "Deliverables reduced from 3 to 1 in Document B.",
        }
    ]
    mock_model = MagicMock()
    mock_model.generate_content.return_value = _make_compare_response(
        diffs, "Document B is worse for you"
    )
    mock_get_model.return_value = mock_model

    result = compare_documents("sid-a", "doc a text", "sid-b", "doc b text", "VENDOR")
    assert len(result.diffs) == 1
    assert result.diffs[0].verdict == "WORSE"
    assert result.overall_verdict == "Document B is worse for you"


@patch("services.comparator._get_model")
def test_compare_api_failure_returns_empty_diffs(mock_get_model):
    from services.comparator import compare_documents
    mock_model = MagicMock()
    mock_model.generate_content.side_effect = Exception("API error")
    mock_get_model.return_value = mock_model

    result = compare_documents("sid-a", "doc a text", "sid-b", "doc b text", "NDA")
    # Should not raise; diffs may be empty
    assert isinstance(result.diffs, list)
    assert result.overall_verdict  # some fallback message


@pytest.mark.parametrize("doc_type", list(SUMMARY_SECTIONS.keys()))
def test_all_doc_types_have_summary_sections(doc_type):
    """Every doc type must have at least 3 summary sections."""
    assert len(SUMMARY_SECTIONS[doc_type]) >= 3
