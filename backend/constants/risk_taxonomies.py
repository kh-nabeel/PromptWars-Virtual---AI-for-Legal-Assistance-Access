"""
Per-document-type risk taxonomies.

Each entry defines a risk item the LLM should specifically search for.
The LLM is given ONLY the relevant list for the detected doc type —
this is what makes the risk analysis "smart" rather than generic.

Fields per risk item:
    id          – stable snake_case identifier (used in exports)
    label       – short display name
    description – what to look for in the document
    severity_hint – default severity if found; LLM may adjust to Low/Medium/High
    why_matters – plain-language explanation shown to the user
"""

RISK_TAXONOMIES: dict[str, list[dict]] = {
    "VENDOR": [
        {
            "id": "scope_creep",
            "label": "Scope-Creep / Change-Order Clauses",
            "description": "Is the scope of work precisely defined? How are changes requested and priced?",
            "severity_hint": "HIGH",
            "why_matters": "Vague scope means vendors can demand extra payments or you might not get what you expected.",
        },
        {
            "id": "payment_terms",
            "label": "Payment Terms & Late Fees",
            "description": "When is payment due? Are there late-payment penalties? What triggers the payment obligation?",
            "severity_hint": "HIGH",
            "why_matters": "Unclear payment terms can lead to delayed payments or unexpected fees.",
        },
        {
            "id": "ip_ownership",
            "label": "IP Ownership",
            "description": "Who owns the work product? Is it work-for-hire or does the vendor retain rights?",
            "severity_hint": "HIGH",
            "why_matters": "If the vendor retains IP, you might not fully own the product or service you paid for.",
        },
        {
            "id": "kill_fee",
            "label": "Kill Fee / Cancellation Terms",
            "description": "What happens if the project is cancelled mid-way? Are there excessive termination fees?",
            "severity_hint": "MEDIUM",
            "why_matters": "Harsh termination fees can trap you into paying for a service you no longer need.",
        },
        {
            "id": "indemnification",
            "label": "Indemnification Clause",
            "description": "Are you required to indemnify the vendor against third-party claims? Is it mutual or one-sided?",
            "severity_hint": "MEDIUM",
            "why_matters": "One-sided indemnification can expose your business to significant legal liability.",
        },
        {
            "id": "non_solicitation",
            "label": "Non-Solicitation / Exclusivity",
            "description": "Are you prevented from hiring the vendor's employees or working with competitors?",
            "severity_hint": "MEDIUM",
            "why_matters": "Exclusivity clauses can limit your business operations and future hiring.",
        },
    ],

    "NDA": [
        {
            "id": "overbroad_confidential_info",
            "label": "Overbroad Definition of Confidential Info",
            "description": "Is confidential information defined so broadly that it could cover virtually anything (including public information)?",
            "severity_hint": "HIGH",
            "why_matters": "An overbroad definition could prevent you from discussing things you already knew or that are public.",
        },
        {
            "id": "indefinite_duration",
            "label": "Indefinite Duration",
            "description": "Does the NDA have a time limit, or does it last forever?",
            "severity_hint": "HIGH",
            "why_matters": "Indefinite NDAs can bind you for life on information that may no longer be sensitive.",
        },
        {
            "id": "one_sided_obligations",
            "label": "One-Sided Obligations",
            "description": "Does only one party have confidentiality obligations, or are they mutual?",
            "severity_hint": "MEDIUM",
            "why_matters": "If only you are bound, the other party can share information you disclose freely.",
        },
        {
            "id": "no_carveouts",
            "label": "Missing Standard Carve-Outs",
            "description": "Are there carve-outs for information that becomes public, that you independently develop, or that you received from a third party lawfully?",
            "severity_hint": "MEDIUM",
            "why_matters": "Without standard carve-outs, you could be bound to secrecy over things you legitimately knew independently.",
        },
        {
            "id": "injunctive_relief",
            "label": "Automatic Injunctive Relief",
            "description": "Does the NDA automatically entitle the other party to injunctive relief without proving harm?",
            "severity_hint": "MEDIUM",
            "why_matters": "This lowers the bar for the other party to get a court order against you.",
        },
    ],

    # Generic fallback — used when type is OTHER or confidence is low
    "OTHER": [
        {
            "id": "obligations",
            "label": "Key Obligations",
            "description": "What are the primary things each party is required to do? Are they clearly defined and reasonable?",
            "severity_hint": "MEDIUM",
            "why_matters": "Vague obligations can lead to disputes about what was agreed.",
        },
        {
            "id": "money",
            "label": "Payment & Financial Terms",
            "description": "What money changes hands? When, how, and under what conditions?",
            "severity_hint": "MEDIUM",
            "why_matters": "Financial terms have the most direct impact on you.",
        },
        {
            "id": "duration",
            "label": "Duration & Dates",
            "description": "How long does this agreement last? Are there automatic renewals?",
            "severity_hint": "LOW",
            "why_matters": "Knowing when the agreement ends (and whether it renews) is fundamental.",
        },
        {
            "id": "termination",
            "label": "Termination Rights",
            "description": "How can either party end this agreement? What notice is required?",
            "severity_hint": "MEDIUM",
            "why_matters": "Unfavorable termination clauses can trap you in an agreement.",
        },
        {
            "id": "dispute_resolution",
            "label": "Dispute Resolution",
            "description": "How are disagreements resolved? Is arbitration required?",
            "severity_hint": "MEDIUM",
            "why_matters": "Dispute clauses determine your legal options if something goes wrong.",
        },
    ],
}

