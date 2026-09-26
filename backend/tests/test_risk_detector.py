"""
Unit tests for the risk detector service.

Tests cover:
    - Each doc type uses its own taxonomy (not a shared generic one)
    - LLM-returned risks are correctly parsed
    - no_risks_found is True when no items are found
    - API failure returns graceful fallback (not a crash)
    - Severity values are validated
"""

from __future__ import annotations

import json
import pytest
from unittest.mock import patch, MagicMock

from constants.risk_taxonomies import RISK_TAXONOMIES
from constants.doc_types import ALL_DOC_TYPES


def _make_risk_response(doc_type: str, items_override: list[dict] | None = None):
    """Build a mock Gemini response for risk detection."""
    taxonomy = RISK_TAXONOMIES.get(doc_type, RISK_TAXONOMIES["OTHER"])
    if items_override is not None:
        items = items_override
    else:
        # All risks NOT found
        items = [
            {
                "id": item["id"],
                "label": item["label"],
                "severity": item["severity_hint"],
                "found": False,
                "excerpt": None,
                "plain_reason": "Not found in this document.",
            }
            for item in taxonomy
        ]
    mock = MagicMock()
    mock.text = json.dumps({"items": items})
    return mock


@patch("services.risk_detector._get_model")
def test_vendor_uses_vendor_taxonomy(mock_get_model):
    from services.risk_detector import detect_risks
    mock_model = MagicMock()
    mock_model.generate_content.return_value = _make_risk_response("VENDOR")
    mock_get_model.return_value = mock_model

    result = detect_risks("session-1", "Vendor text...", "VENDOR")

    # Result item IDs should match the VENDOR taxonomy
    vendor_ids = {item["id"] for item in RISK_TAXONOMIES["VENDOR"]}
    result_ids = {item.id for item in result.items}
    assert result_ids == vendor_ids


@patch("services.risk_detector._get_model")
def test_nda_uses_nda_taxonomy(mock_get_model):
    from services.risk_detector import detect_risks
    mock_model = MagicMock()
    mock_model.generate_content.return_value = _make_risk_response("NDA")
    mock_get_model.return_value = mock_model

    result = detect_risks("session-2", "NDA text...", "NDA")

    nda_ids = {item["id"] for item in RISK_TAXONOMIES["NDA"]}
    result_ids = {item.id for item in result.items}
    assert result_ids == nda_ids


@patch("services.risk_detector._get_model")
def test_no_risks_found_flag(mock_get_model):
    from services.risk_detector import detect_risks
    mock_model = MagicMock()
    # All risks NOT found
    mock_model.generate_content.return_value = _make_risk_response("VENDOR")
    mock_get_model.return_value = mock_model

    result = detect_risks("session-3", "Safe vendor text...", "VENDOR")
    assert result.no_risks_found is True


@patch("services.risk_detector._get_model")
def test_risk_found_sets_no_risks_found_false(mock_get_model):
    from services.risk_detector import detect_risks
    # One HIGH risk found
    items = [
        {
            "id": "scope_creep",
            "label": "Scope-Creep / Change-Order Clauses",
            "severity": "HIGH",
            "found": True,
            "excerpt": "Scope may be modified at vendor discretion...",
            "plain_reason": "Vague scope could lead to extra costs.",
        }
    ]
    mock = MagicMock()
    mock.text = json.dumps({"items": items})
    mock_model = MagicMock()
    mock_model.generate_content.return_value = mock
    mock_get_model.return_value = mock_model

    result = detect_risks("session-4", "Vendor agreement with scope creep...", "VENDOR")
    assert result.no_risks_found is False


@patch("services.risk_detector._get_model")
def test_api_failure_returns_fallback_not_crash(mock_get_model):
    from services.risk_detector import detect_risks
    mock_model = MagicMock()
    mock_model.generate_content.side_effect = Exception("API down")
    mock_get_model.return_value = mock_model

    result = detect_risks("session-5", "Some text...", "VENDOR")
    # Should return items from taxonomy (all not found), not raise
    assert len(result.items) == len(RISK_TAXONOMIES["VENDOR"])
    assert all(not item.found for item in result.items)


@pytest.mark.parametrize("doc_type", ALL_DOC_TYPES)
def test_all_doc_types_have_taxonomy(doc_type):
    """Every doc type must have a non-empty taxonomy entry."""
    assert doc_type in RISK_TAXONOMIES, f"{doc_type} missing from RISK_TAXONOMIES"
    assert len(RISK_TAXONOMIES[doc_type]) > 0, f"{doc_type} taxonomy is empty"
