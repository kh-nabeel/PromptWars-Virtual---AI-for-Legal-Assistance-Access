"""
Pydantic v2 request/response schemas.

All API I/O is typed here — no raw dicts cross module boundaries.
"""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Upload / Classification
# ---------------------------------------------------------------------------

class ClassificationResult(BaseModel):
    """Result from the document classifier."""
    doc_type: str = Field(description="One of the DocType enum values")
    label: str = Field(description="Human-readable label for the detected type")
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str = Field(description="Brief explanation of why this type was chosen")
    low_confidence: bool = Field(
        default=False,
        description="True when confidence < threshold — fallback path was used",
    )


class UploadResponse(BaseModel):
    session_id: str
    filename: str
    char_count: int
    classification: ClassificationResult
    text: str


# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

class SummarySection(BaseModel):
    title: str
    content: str


class SummaryResponse(BaseModel):
    session_id: str
    doc_type: str
    sections: list[SummarySection]


# ---------------------------------------------------------------------------
# Risk Analysis
# ---------------------------------------------------------------------------

class RiskItem(BaseModel):
    id: str
    label: str
    severity: str = Field(description="LOW | MEDIUM | HIGH")
    found: bool = Field(description="Whether this risk was found in the document")
    excerpt: Optional[str] = Field(default=None, description="Relevant quote from doc")
    plain_reason: str = Field(description="Why this matters in plain language")


class RiskResponse(BaseModel):
    session_id: str
    doc_type: str
    items: list[RiskItem]
    no_risks_found: bool = Field(
        default=False,
        description="True when no items of severity >= MEDIUM were found",
    )


# ---------------------------------------------------------------------------
# Comparison
# ---------------------------------------------------------------------------

class ComparisonDiff(BaseModel):
    section: str
    change_type: str = Field(description="ADDED | REMOVED | CHANGED | UNCHANGED")
    doc_a_text: Optional[str] = None
    doc_b_text: Optional[str] = None
    verdict: str = Field(description="BETTER | WORSE | NEUTRAL — for the user")
    explanation: str


class CompareResponse(BaseModel):
    session_id_a: str
    session_id_b: str
    doc_type: str
    diffs: list[ComparisonDiff]
    overall_verdict: str


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    session_id: str
    message: str = Field(max_length=2000)
    # Optional second session for comparison chat
    session_id_b: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    found_in_document: bool = Field(
        description="False when the answer could not be grounded in the document"
    )


# ---------------------------------------------------------------------------
# Export
# ---------------------------------------------------------------------------

class ExportResponse(BaseModel):
    session_id: str
    doc_type: str
    checklist: list[str]
    lawyer_questions: list[str]


# ---------------------------------------------------------------------------
# Type Correction
# ---------------------------------------------------------------------------

class CorrectTypeRequest(BaseModel):
    session_id: str
    corrected_type: str


class CorrectTypeResponse(BaseModel):
    session_id: str
    doc_type: str
    label: str
    message: str
