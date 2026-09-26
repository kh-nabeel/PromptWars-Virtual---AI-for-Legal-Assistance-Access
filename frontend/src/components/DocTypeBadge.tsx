/**
 * DocTypeBadge — shows the detected document type, confidence, and
 * a dropdown to let the user correct the classification.
 */
import { useState } from 'react'
import { CheckCircle, AlertCircle, ChevronDown } from 'lucide-react'
import { ALL_DOC_TYPES, type ClassificationResult } from '../api/client'

interface Props {
  classification: ClassificationResult
  onCorrect: (newType: string) => void
  correcting: boolean
}

export function DocTypeBadge({ classification, onCorrect, correcting }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(classification.doc_type)

  const confidencePct = Math.round(classification.confidence * 100)
  const isLow = classification.low_confidence

  function handleSelect(value: string) {
    setSelected(value)
    setOpen(false)
    if (value !== classification.doc_type) {
      onCorrect(value)
    }
  }

  return (
    <div className="surface-card p-4 animate-fade-in space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {isLow ? (
            <AlertCircle className="text-amber-600 shrink-0" size={18} aria-hidden="true" />
          ) : (
            <CheckCircle className="text-risk-low shrink-0" size={18} aria-hidden="true" />
          )}
          <div>
            <p className="text-xs text-gray-500 font-medium">
              Detected Document Type
            </p>
            <p className="font-semibold text-ink">{classification.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Confidence pill */}
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded border ${
              isLow
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-green-50 text-risk-low border-green-200'
            }`}
          >
            {confidencePct}% confidence
          </span>

          {/* Correction dropdown */}
          <div className="relative">
            <button
              id="correct-type-btn"
              aria-label="Correct detected document type"
              aria-expanded={open}
              aria-haspopup="listbox"
              onClick={() => setOpen(!open)}
              className="btn-ghost text-xs"
              disabled={correcting}
            >
              {correcting ? 'Updating…' : 'Correct type'}
              <ChevronDown
                size={14}
                className={`transition-transform ${open ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {open && (
              <ul
                role="listbox"
                aria-label="Document types"
                className="absolute right-0 mt-1 z-50 bg-white border border-gray-200
                           rounded shadow-lg min-w-[220px] py-1 animate-fade-in"
              >
                {ALL_DOC_TYPES.map(({ value, label }) => (
                  <li
                    key={value}
                    role="option"
                    aria-selected={selected === value}
                    onClick={() => handleSelect(value)}
                    className={`px-4 py-2 text-sm cursor-pointer transition-colors
                                hover:bg-gray-50
                                ${selected === value ? 'text-primary font-semibold' : 'text-ink'}`}
                  >
                    {label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Reason + low confidence warning */}
      {isLow && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200
                       rounded px-3 py-2">
          ⚠️ {classification.reason}
        </p>
      )}
      {!isLow && (
        <p className="text-xs text-gray-500">{classification.reason}</p>
      )}
    </div>
  )
}
