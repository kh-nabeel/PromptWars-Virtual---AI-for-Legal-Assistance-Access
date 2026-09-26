"""
Document type constants used across all modules.
Keeping the source of truth here prevents typo-bugs when comparing types.
"""

from enum import Enum


class DocType(str, Enum):
    VENDOR = "VENDOR"
    NDA = "NDA"
    OTHER = "OTHER"

# Human-readable labels for the UI
DOC_TYPE_LABELS: dict[str, str] = {
    DocType.VENDOR: "Vendor / Supplier Agreement",
    DocType.NDA: "Non-Disclosure Agreement (NDA)",
    DocType.OTHER: "Other / Unrecognized",
}

# All valid types the classifier may return
ALL_DOC_TYPES: list[str] = [t.value for t in DocType]
