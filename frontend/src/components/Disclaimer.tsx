/**
 * Disclaimer — displayed on every legal-sounding output.
 * Non-intrusive banner reminding users this is informational only.
 */
import { AlertTriangle } from 'lucide-react'

export function Disclaimer() {
  return (
    <aside
      role="note"
      aria-label="Legal disclaimer"
      className="flex items-start gap-3 px-4 py-3 rounded
                 bg-amber-50 border border-amber-200 text-amber-800 text-xs"
    >
      <AlertTriangle className="shrink-0 mt-0.5 text-amber-600" size={14} aria-hidden="true" />
      <p>
        <strong>Informational only — not legal advice.</strong>{' '}
        Clarivo uses AI to help you understand documents. Always have a licensed attorney
        review any agreement before you sign.
      </p>
    </aside>
  )
}
