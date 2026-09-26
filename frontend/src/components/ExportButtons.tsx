/**
 * ExportButtons — triggers export generation and displays/downloads
 * the "before you sign" checklist and "questions for my lawyer" list.
 */
import { useState } from 'react'
import { Download, ClipboardList, MessageCircleQuestion, Loader2, CheckCircle2 } from 'lucide-react'
import { getExport, type ExportResponse } from '../api/client'
import { Disclaimer } from './Disclaimer'

interface Props {
  sessionId: string
  docType: string
}

export function ExportButtons({ sessionId, docType }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ExportResponse | null>(null)

  async function handleExport() {
    setLoading(true)
    setError(null)
    try {
      const result = await getExport(sessionId)
      setData(result)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Export failed. Make sure you have viewed the Risk panel first.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function downloadTxt() {
    if (!data) return
    const content = [
      `Clarivo Export — ${docType}`,
      '='.repeat(50),
      '',
      '⚠️ INFORMATIONAL ONLY — NOT LEGAL ADVICE',
      'Always have a licensed attorney review before signing.',
      '',
      'BEFORE YOU SIGN — CHECKLIST',
      '-'.repeat(30),
      ...data.checklist.map((item, i) => `${i + 1}. ${item}`),
      '',
      'QUESTIONS FOR MY LAWYER',
      '-'.repeat(30),
      ...data.lawyer_questions.map((q, i) => `${i + 1}. ${q}`),
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clarivo-export-${docType.toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section aria-label="Export checklist" className="space-y-4">
      <div className="flex items-center gap-2">
        <ClipboardList size={16} className="text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-ink">
          Export · {docType}
        </h2>
      </div>

      <Disclaimer />

      {!data && (
        <div className="surface-card p-6 text-center space-y-3">
          <p className="text-gray-700 text-sm">
            Generate a personalized "Before You Sign" checklist and list of questions
            for your attorney, based on the risks found in this document.
          </p>
          <p className="text-xs text-gray-500">
            You must view the Risk &amp; Attention panel before exporting.
          </p>
          <button
            onClick={handleExport}
            disabled={loading}
            className="btn-primary mx-auto"
            id="generate-export-btn"
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" aria-hidden="true" /> Generating…</>
            ) : (
              <><ClipboardList size={14} aria-hidden="true" /> Generate Export</>
            )}
          </button>
          {error && (
            <p role="alert" className="text-risk-high text-xs">{error}</p>
          )}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {/* Checklist */}
          <div className="surface-card p-4 space-y-3">
            <h3 className="font-semibold text-ink flex items-center gap-2 text-sm">
              <CheckCircle2 size={15} className="text-primary" aria-hidden="true" />
              Before You Sign — Checklist
            </h3>
            <ol className="space-y-2" aria-label="Before you sign checklist">
              {data.checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-blue-50 text-primary
                                   text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          {/* Lawyer questions */}
          <div className="surface-card p-4 space-y-3">
            <h3 className="font-semibold text-ink flex items-center gap-2 text-sm">
              <MessageCircleQuestion size={15} className="text-accent" aria-hidden="true" />
              Questions for My Lawyer
            </h3>
            <ol className="space-y-2" aria-label="Questions for your lawyer">
              {data.lawyer_questions.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-amber-50 text-accent
                                   text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {q}
                </li>
              ))}
            </ol>
          </div>

          {/* Download button */}
          <button
            onClick={downloadTxt}
            className="btn-ghost w-full justify-center"
            id="download-export-btn"
            aria-label="Download export as text file"
          >
            <Download size={14} aria-hidden="true" />
            Download as .txt
          </button>
        </div>
      )}
    </section>
  )
}
