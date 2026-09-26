/**
 * Header — sticky glassmorphism top navigation.
 * Shows nav links on the home page; shows a 'New document' reset button
 * when a document is loaded.
 */
import { RefreshCw, Scale, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface Props {
  hasSession: boolean
  onReset: () => void
  onAnalyzeClick: () => void
}

export function Header({ hasSession, onReset, onAnalyzeClick }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(6,13,26,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={onReset}
          className="flex items-center gap-2.5 group"
          aria-label="Go to home"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C99A2E, #dfae36)' }}
          >
            <Scale size={16} className="text-white" />
          </div>
          <span
            className="font-serif font-bold text-xl text-white group-hover:text-accent transition-colors"
          >
            Clarivo
          </span>
        </button>

        {/* Desktop Nav */}
        {!hasSession && (
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            <a href="#how-it-works" className="nav-link">How it works</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#upload" className="nav-link">Try it free</a>
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {hasSession ? (
            <button
              onClick={onReset}
              className="btn-ghost text-sm"
              aria-label="Back to Home"
            >
              <RefreshCw size={14} />
              Back to Home
            </button>
          ) : (
            <>
              <button
                onClick={onAnalyzeClick}
                className="btn-accent text-sm"
                aria-label="Analyze your document"
              >
                Analyze Document
              </button>
              {/* Mobile menu toggle */}
              <button
                className="md:hidden text-white/70 hover:text-white transition-colors p-1"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle navigation"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && !hasSession && (
        <nav
          className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
          style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(6,13,26,0.95)' }}
        >
          <a href="#how-it-works" className="nav-link text-base" onClick={() => setMobileOpen(false)}>How it works</a>
          <a href="#features" className="nav-link text-base" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#upload" className="nav-link text-base" onClick={() => setMobileOpen(false)}>Try it free</a>
        </nav>
      )}
    </header>
  )
}
