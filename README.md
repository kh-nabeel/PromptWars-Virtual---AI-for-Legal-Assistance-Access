# Clarivo

**Know what you're signing, before you sign it.**

Clarivo is an AI-powered document review tool built for small-business owners who need to understand vendor agreements and NDAs before signing. It reads the document, highlights risky clauses in plain language, and helps you ask the right questions — all without replacing your attorney.

## Who It's For

Small-business owners reviewing vendor agreements and NDAs before signing. Every feature, every risk category, and every piece of copy is designed for this person specifically.

## How It Works

Upload your vendor agreement or NDA. Clarivo processes it through a type-aware pipeline:

1. **Extraction** — Text is safely extracted from PDF, DOCX, or plain text using `pdfplumber` and `python-docx`.
2. **Classification** — The document is identified as a Vendor Agreement, NDA, or Other. If confidence is low, users can correct the type.
3. **Inline Risk Highlighting** — The full document text is rendered as a reading pane. Risky clauses are highlighted inline with margin notes explaining what they mean in plain language. Risk severity (HIGH / MEDIUM / LOW) is always labeled — never color-only.
4. **Summary Checklist** — A "Before You Sign" checklist summarizes the key points specific to the detected document type.
5. **Chat Q&A** — Ask questions about the document. The AI answers strictly from the document text and flags when information isn't found.
6. **Export** — Generate a downloadable checklist and list of questions for your attorney.

## Architecture

- **Frontend**: React 18 + Vite, styled with Tailwind CSS using a custom design system (Lora serif headings, Inter sans-serif body, ivory background, navy primary). No gradients, no glassmorphism, no generic icons.
- **Backend**: FastAPI (Python) with in-memory session caching. Document text stays server-side after upload. All LLM calls go through Google Gemini.
- **Security**: Strict 10 MB upload limits, MIME type validation, API key via environment variables (never exposed to client).

## How to Run Locally

### Prerequisites
- Python 3.11+
- Node.js 18+
- A Google Gemini API Key

### Backend
```bash
cd backend
python -m venv .venv

# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt

# Create .env with your Gemini key:
cp .env.example .env
# Edit .env → GEMINI_API_KEY=your_key_here

python -m uvicorn main:app --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Running Tests
```bash
cd backend
pytest --tb=short
```

## Scope

This is a hackathon MVP. Document types are intentionally limited to **Vendor Agreements**, **NDAs**, and **Other**. Session data is in-memory only (no persistence across restarts).

---

*Clarivo — informational only, not legal advice. Built for the PromptWars Legal Hackathon.*
