/**
 * ComparePanel — upload a second document and display the comparison.
 * Only shown after primary document is uploaded.
 * Type-mismatch errors are surfaced clearly.
 */
import { useState } from 'react'
import { GitCompareArrows, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { CompareResponse, ComparisonDiff } from '../api/client'
import { UploadPanel } from './UploadPanel'
import { Disclaimer } from './Disclaimer'
import { compareDocuments } from '../api/client'

interface Props {
  sessionIdA: string
  docType: string
}

function VerdictIcon({ verdict }: { verdict: string }) {
  if (verdict === 'BETTER') return <TrendingUp size={14} className="text-risk-low" aria-hidden="true" />
  if (verdict === 'WORSE') return <TrendingDown size={14} className="text-risk-high" aria-hidden="true" />
  return <Minus size={14} className="text-gray-400" aria-hidden="true" />
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const cls =
    verdict === 'BETTER'
      ? 'bg-green-50 text-risk-low border-green-200'
      : verdict === 'WORSE'
      ? 'bg-red-50 text-risk-high border-red-200'
      : 'bg-gray-50 text-gray-500 border-gray-200'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${cls}`}>
      <VerdictIcon verdict={verdict} />
      {verdict}
    </span>
  )
}

export function ComparePanel({ sessionIdA, docType }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CompareResponse | null>(null)

  async function handleUpload(file: File) {
    setError(null)
    setLoading(true)
    setResult(null)
    try {
      const data = await compareDocuments(sessionIdA, file)
      setResult(data)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Comparison failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section aria-label="Document comparison" className="space-y-4">
      <div className="flex items-center gap-2">
        <GitCompareArrows size={16} className="text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-ink">
          Compare Documents · {docType}
        </h2>
      </div>

      <Disclaimer />

      {!result && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">
            Upload a second <strong>{docType}</strong> document to compare it with the first.
            Comparison is only available between documents of the same type.
          </p>
          <UploadPanel
            onUpload={handleUpload}
            loading={loading}
            error={error}
            label="Upload Second Document"
          />
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Overall verdict */}
          <div className="surface-card p-4">
            <p className="text-xs text-gray-500 font-medium mb-1">
              Overall Verdict
            </p>
            <p className="text-ink font-semibold">{result.overall_verdict}</p>
          </div>

          {/* Section diffs */}
          <div className="space-y-2" role="list" aria-label="Comparison results">
            {result.diffs.map((diff, idx) => (
              <DiffCard key={idx} diff={diff} />
            ))}
          </div>

          {/* Reset */}
          <button
            onClick={() => { setResult(null); setError(null) }}
            className="btn-ghost text-xs"
          >
            Compare a different document
          </button>
        </div>
      )}
    </section>
  )
}

function DiffCard({ diff }: { diff: ComparisonDiff }) {
  const [open, setOpen] = useState(diff.verdict !== 'UNCHANGED')

  return (
    <div role="listitem" className="surface-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3
                   text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <VerdictBadge verdict={diff.verdict} />
        <span className="flex-1 font-semibold text-ink text-sm">{diff.section}</span>
        <span className="text-xs text-gray-400 shrink-0">{diff.change_type}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-100 space-y-3">
          <p className="text-sm text-gray-700">{diff.explanation}</p>
          {(diff.doc_a_text || diff.doc_b_text) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-xs text-risk-high font-semibold mb-1">Document A</p>
                <p className="text-xs text-gray-700">{diff.doc_a_text ?? '—'}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-xs text-risk-low font-semibold mb-1">Document B</p>
                <p className="text-xs text-gray-700">{diff.doc_b_text ?? '—'}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
