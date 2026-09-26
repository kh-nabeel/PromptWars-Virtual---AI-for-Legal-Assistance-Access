"""
Per-document-type summary section templates.

The summarizer uses these to request type-specific plain-language sections
from the LLM, rather than a one-size-fits-all generic summary.
"""

SUMMARY_SECTIONS: dict[str, list[str]] = {
    "VENDOR": [
        "Scope of Service / Deliverables",
        "Payment Terms & Schedule",
        "Intellectual Property Ownership",
        "Revisions & Change Orders",
        "Termination & Cancellation",
        "Confidentiality",
        "Indemnification & Liability",
    ],
    "NDA": [
        "Parties",
        "What Counts as Confidential",
        "Permitted Uses",
        "Duration",
        "Obligations of Each Party",
        "Exceptions & Carve-outs",
        "Remedies for Breach",
    ],
    # Generic fallback for OTHER / low-confidence types
    "OTHER": [
        "Parties & Purpose",
        "Key Obligations",
        "Money & Payments",
        "Duration & Dates",
        "Termination",
        "Dispute Resolution",
    ],
}
