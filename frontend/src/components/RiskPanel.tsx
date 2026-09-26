/**
 * RiskPanel — displays type-specific risk findings with severity badges,
 * excerpts, and plain-language explanations.
 */
import { ShieldAlert, ShieldCheck, ChevronDown, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { RiskItem } from '../api/client'

interface Props {
  items: RiskItem[]
  noRisksFound: boolean
  loading: boolean
  docType: string
}

function SeverityBadge({ severity }: { severity: string }) {
  const cls =
    severity === 'HIGH'
      ? 'badge-high'
      : severity === 'MEDIUM'
      ? 'badge-medium'
      : 'badge-low'
  return <span className={cls}>{severity}</span>
}

export function RiskPanel({ items, noRisksFound, loading, docType }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="text-primary animate-spin" size={32} aria-hidden="true" />
        <p className="text-gray-500 text-sm">Checking for potential risks…</p>
      </div>
    )
  }

  const foundItems = items.filter((i) => i.found)
  const notFoundItems = items.filter((i) => !i.found)

  return (
    <section aria-label="Risk and attention panel" className="space-y-4">
      <div className="flex items-center gap-2">
        <ShieldAlert size={16} className="text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-ink">
          Risk &amp; Attention · {docType}
        </h2>
      </div>

      <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded px-3 py-2">
        This analysis is informational only — not legal advice. Always consult a qualified attorney before signing.
      </p>

      {/* No-risk message */}
      {noRisksFound && (
        <div className="flex items-start gap-3 px-4 py-3 rounded
                        bg-risk-low/10 border border-risk-low/25 text-ink text-sm">
          <ShieldCheck size={18} className="shrink-0 mt-0.5 text-risk-low" aria-hidden="true" />
          <p>
            <strong>No significant risks detected</strong> based on the type-specific checklist for
            this {docType} document. That's a good sign — but still review the full document
            carefully before signing.
          </p>
        </div>
      )}

      {/* Found risks */}
      {foundItems.length > 0 && (
        <div className="space-y-2" role="list" aria-label="Flagged risks">
          {foundItems.map((item) => (
            <div key={item.id} role="listitem" className="surface-card overflow-hidden">
              <button
                id={`risk-${item.id}`}
                aria-expanded={openId === item.id}
                aria-controls={`risk-content-${item.id}`}
                onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className="w-full flex items-center gap-3 px-4 py-3
                           text-left hover:bg-gray-50 transition-colors"
              >
                <SeverityBadge severity={item.severity} />
                <span className="flex-1 font-semibold text-ink text-sm">{item.label}</span>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform duration-200 shrink-0
                              ${openId === item.id ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </button>

              {openId === item.id && (
                <div
                  id={`risk-content-${item.id}`}
                  role="region"
                  aria-labelledby={`risk-${item.id}`}
                  className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3"
                >
                  <p className="text-sm text-gray-700 leading-relaxed">{item.plain_reason}</p>
                  {item.excerpt && (
                    <blockquote className="border-l-2 border-primary pl-3 text-xs
                                          text-gray-500 italic leading-relaxed">
                      "{item.excerpt}"
                    </blockquote>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Items NOT found — collapsed section */}
      {notFoundItems.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700
                              transition-colors select-none list-none flex items-center gap-1">
            <ChevronDown
              size={12}
              className="transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
            {notFoundItems.length} risk{notFoundItems.length !== 1 ? 's' : ''} not detected
          </summary>
          <ul className="mt-2 space-y-1 pl-4" aria-label="Risks not found">
            {notFoundItems.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-xs text-gray-500">
                <ShieldCheck size={12} className="text-risk-low shrink-0" aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  )
}
