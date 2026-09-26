import React from 'react'
import type { UploadResponse, SummaryResponse, RiskResponse, RiskItem } from '../api/client'
import { ChatPanel } from './ChatPanel'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'

interface Props {
  session: UploadResponse
  summary: SummaryResponse | null
  risks: RiskResponse | null
}

function HighlightedParagraph({ text, risks }: { text: string; risks: RiskItem[] }) {
  // Simple highlighting: find the first excerpt that matches
  let content: React.ReactNode = text
  let matchedRisk: RiskItem | null = null

  // We only highlight one risk per paragraph for simplicity in this MVP
  for (const risk of risks) {
    if (risk.found && risk.excerpt && text.includes(risk.excerpt)) {
      matchedRisk = risk
      break
    }
  }

  if (matchedRisk && matchedRisk.excerpt) {
    const parts = text.split(matchedRisk.excerpt)
    const severityClass = 
      matchedRisk.severity === 'HIGH' ? 'bg-risk-high/20 border-b-2 border-risk-high' :
      matchedRisk.severity === 'MEDIUM' ? 'bg-risk-medium/20 border-b-2 border-risk-medium' :
      'bg-risk-low/20 border-b-2 border-risk-low'

    content = (
      <>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && (
              <mark className={`text-ink px-1 rounded-sm ${severityClass}`}>
                {matchedRisk?.excerpt}
              </mark>
            )}
          </React.Fragment>
        ))}
      </>
    )
  }

  return (
    <div className="relative mb-6 text-sm leading-relaxed text-ink/90 flex flex-col md:flex-row gap-6 group">
      <div className="flex-1">
        {content}
      </div>
      
      {/* Margin Note */}
      {matchedRisk && (
        <aside className="md:w-64 shrink-0 bg-surface border border-gray-200 shadow-sm rounded p-3 text-xs opacity-90 group-hover:opacity-100 transition-opacity">
          <div className="flex items-start gap-2 mb-1">
            <AlertTriangle 
              size={14} 
              className={
                matchedRisk.severity === 'HIGH' ? 'text-risk-high' :
                matchedRisk.severity === 'MEDIUM' ? 'text-risk-medium' :
                'text-risk-low'
              } 
            />
            <span className="font-semibold text-ink">{matchedRisk.label}</span>
          </div>
          <p className="text-gray-700 leading-snug">{matchedRisk.plain_reason}</p>
        </aside>
      )}
      {!matchedRisk && <div className="hidden md:block md:w-64 shrink-0" />}
    </div>
  )
}

export function DocumentReader({ session, summary, risks }: Props) {
  const paragraphs = (session.text || '').split(/\n\n+/).filter(p => p.trim().length > 0)
  const foundRisks = risks?.items.filter(r => r.found) || []

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      {/* Document & Checklist Column */}
      <div className="flex-1 w-full flex flex-col gap-8">
        
        {/* Checklist / Summary */}
        <section className="bg-surface border border-gray-100 rounded-2xl p-6" style={{ boxShadow: '0 4px 24px rgba(22,50,79,0.07)' }}>
          <h2 className="text-xl font-serif font-bold text-primary mb-4 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-primary" />
            Before you sign
          </h2>
          {summary ? (
            <ul className="space-y-3">
              {summary.sections.map((sec, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <div className="w-4 h-4 rounded-full bg-blue-50 border border-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-ink">{sec.title}</strong>
                    <span className="text-gray-600">{sec.content}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 animate-pulse">Generating checklist...</p>
          )}
        </section>

        {/* Document Reading Pane */}
        <section className="bg-surface border border-gray-100 p-8 sm:p-12 rounded-2xl" style={{ boxShadow: '0 4px 24px rgba(22,50,79,0.07)' }}>
          <header className="mb-8 border-b border-gray-100 pb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
              Document Text
            </p>
            <h3 className="text-lg font-serif font-bold text-ink">{session.filename}</h3>
          </header>

          <div className="font-sans">
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => (
                <HighlightedParagraph key={i} text={p} risks={foundRisks} />
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No text extracted.</p>
            )}
          </div>
        </section>
      </div>

      {/* Chat Sidebar */}
      <div className="w-full lg:w-80 shrink-0 sticky top-24">
        <div className="bg-surface border border-gray-100 rounded-2xl overflow-hidden h-[600px] flex flex-col" style={{ boxShadow: '0 4px 24px rgba(22,50,79,0.07)' }}>
          <div className="p-4 border-b border-gray-100 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, rgba(22,50,79,0.03), rgba(201,154,46,0.02))' }}>
            <Info size={16} className="text-primary" />
            <h2 className="font-semibold text-primary text-sm">Ask questions</h2>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <ChatPanel sessionId={session.session_id} />
          </div>
        </div>
      </div>
    </div>
  )
}
