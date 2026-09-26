/**
 * SummaryView — renders the type-specific plain-language summary sections.
 * Each section is an expandable accordion-style card.
 */
import { useState } from 'react'
import { ChevronDown, BookOpen, Loader2 } from 'lucide-react'
import type { SummarySection } from '../api/client'
import { Disclaimer } from './Disclaimer'

interface Props {
  sections: SummarySection[]
  loading: boolean
  docType: string
}

export function SummaryView({ sections, loading, docType }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader2 className="text-primary animate-spin" size={32} aria-hidden="true" />
        <p className="text-gray-500 text-sm">Generating plain-language summary…</p>
      </div>
    )
  }

  return (
    <section aria-label="Document summary" className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen size={16} className="text-primary" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-ink">
          Plain-Language Summary · {docType}
        </h2>
      </div>

      <Disclaimer />

      <div className="space-y-2" role="list">
        {sections.map((section, idx) => (
          <div
            key={section.title}
            role="listitem"
            className="surface-card overflow-hidden"
          >
            <button
              id={`summary-section-${idx}`}
              aria-expanded={openIdx === idx}
              aria-controls={`summary-content-${idx}`}
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              className="w-full flex items-center justify-between px-4 py-3
                         text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-ink text-sm">{section.title}</span>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 shrink-0
                            ${openIdx === idx ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {openIdx === idx && (
              <div
                id={`summary-content-${idx}`}
                role="region"
                aria-labelledby={`summary-section-${idx}`}
                className="px-4 pb-4 text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-3"
              >
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
