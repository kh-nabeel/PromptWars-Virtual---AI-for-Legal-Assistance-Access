/**
 * HomePage — Landing page with:
 *   - Hero section (dark, full-width, hero image)
 *   - Stats bar
 *   - How it works (3 steps)
 *   - Feature cards grid
 *   - Upload CTA section
 *   - About section
 */
import { UploadPanel } from './UploadPanel'
import {
  FileSearch,
  ShieldCheck,
  MessageSquareText,
  Zap,
  BookOpen,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Upload,
  ScanSearch,
  FileCheck,
} from 'lucide-react'

interface Props {
  onUpload: (file: File) => void
  loading: boolean
  error: string | null
}

// ── How It Works Steps ──────────────────────────────────────────────────────
const STEPS = [
  {
    icon: Upload,
    number: '01',
    title: 'Upload your document',
    desc: 'Drag & drop or click to upload any PDF, DOCX, or TXT legal file up to 10 MB. Your document is processed securely.',
    color: '#16324F',
  },
  {
    icon: ScanSearch,
    number: '02',
    title: 'AI scans every clause',
    desc: 'Gemini AI reads the entire document, identifies document type, flags risky clauses, and generates a plain-language summary.',
    color: '#C99A2E',
  },
  {
    icon: FileCheck,
    number: '03',
    title: 'Review with confidence',
    desc: 'Browse highlighted risks, read plain-English explanations, and ask follow-up questions — all in one place.',
    color: '#4B7B62',
  },
]

// ── Feature Cards ───────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: FileSearch,
    title: 'Risk Highlighting',
    desc: 'Every risky clause is highlighted directly in the document text with severity ratings — HIGH, MEDIUM, or LOW.',
    color: '#B3432B',
    bg: 'rgba(179,67,43,0.08)',
  },
  {
    icon: ShieldCheck,
    title: 'Plain English Summary',
    desc: "Complex legal jargon translated to everyday language so you understand exactly what you're agreeing to.",
    color: '#16324F',
    bg: 'rgba(22,50,79,0.08)',
  },
  {
    icon: MessageSquareText,
    title: 'Ask Anything',
    desc: 'Chat with Clarivo about your document. Ask specific questions and get answers grounded only in your document.',
    color: '#C99A2E',
    bg: 'rgba(201,154,46,0.08)',
  },
  {
    icon: Zap,
    title: 'Instant Analysis',
    desc: 'Full document analysis in under 30 seconds. No waiting, no queues — powered by the latest Gemini models.',
    color: '#4B7B62',
    bg: 'rgba(75,123,98,0.08)',
  },
  {
    icon: BookOpen,
    title: 'Document Types',
    desc: 'Supports NDAs, vendor agreements, employment contracts and more. Auto-detects document type for tailored analysis.',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.08)',
  },
  {
    icon: BarChart3,
    title: 'Risk Dashboard',
    desc: 'Visual overview of all identified risks sorted by severity. Know at a glance how risky your contract is.',
    color: '#D97706',
    bg: 'rgba(217,119,6,0.08)',
  },
]

// ── Stat items ───────────────────────────────────────────────────────────────
const STATS = [
  { value: '< 30s', label: 'Analysis time' },
  { value: '50+', label: 'Risk patterns detected' },
  { value: '100%', label: 'Private & secure' },
  { value: 'Free', label: 'No sign-up needed' },
]

export function HomePage({ onUpload, loading, error }: Props) {
  const scrollToUpload = () => {
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* ════════════════════════════════════════════════════════════════════
          HERO SECTION
      ═════════════════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #060d1a 0%, #0a1628 45%, #16324F 100%)', minHeight: '90vh' }}
        aria-label="Hero"
      >
        {/* Background hero image */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'url(/hero_legal_ai.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(6,13,26,0.3) 0%, rgba(6,13,26,0.7) 60%, rgba(6,13,26,0.95) 100%)' }}
        />
        {/* Decorative orbs */}
        <div className="orb-gold animate-orb" style={{ width: 500, height: 500, top: '-10%', right: '-5%', opacity: 0.15 }} />
        <div className="orb-navy" style={{ width: 600, height: 600, bottom: '-20%', left: '-10%', opacity: 0.4 }} />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-24 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="section-label animate-fade-up mb-6">
            ✨ AI-Powered Legal Document Analysis
          </div>

          {/* Headline */}
          <h1
            className="font-serif font-bold text-white animate-fade-up-d1 mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: '1.1', maxWidth: '18ch' }}
          >
            Know what you're signing,{' '}
            <span style={{ background: 'linear-gradient(135deg, #C99A2E, #f5c842)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              before you sign it.
            </span>
          </h1>

          {/* Sub-headline */}
          <p
            className="text-lg leading-relaxed animate-fade-up-d2 mb-10"
            style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '52ch' }}
          >
            Upload any NDA or vendor agreement. Clarivo&apos;s AI reads every clause,
            flags hidden risks in plain English, and answers your questions
            &mdash; all in under 30 seconds. No lawyer required.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-center animate-fade-up-d2 mb-16">
            <button
              onClick={scrollToUpload}
              id="hero-cta-primary"
              className="btn-accent text-base px-8 py-4"
            >
              Analyze My Document
              <ArrowRight size={18} />
            </button>
            <a
              href="#how-it-works"
              className="btn-outline-white text-base px-8 py-4"
            >
              See how it works
            </a>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-3 justify-center animate-fade-up-d3">
            {STATS.map((stat) => (
              <div key={stat.label} className="stat-pill">
                <span className="font-bold text-accent">{stat.value}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #F7F8FC)' }}
        />
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ═════════════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="py-24 px-6 bg-bg"
        aria-labelledby="how-it-works-heading"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="section-label mb-4">Simple Process</div>
            <h2
              id="how-it-works-heading"
              className="font-serif font-bold text-primary mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
            >
              Three steps to clarity
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              No account needed. No credit card. Just upload and understand.
            </p>
          </div>

          {/* Steps grid + illustration */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Illustration */}
            <div className="order-2 lg:order-1 animate-fade-up">
              <img
                src="/how_it_works.jpg"
                alt="How Clarivo works: upload, AI scan, review"
                className="w-full max-w-lg mx-auto rounded-2xl shadow-card-hover object-cover"
                style={{ aspectRatio: '4/3' }}
              />
            </div>

            {/* Steps */}
            <div className="order-1 lg:order-2 space-y-8">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className="flex gap-5 group"
                >
                  {/* Step icon */}
                  <div className="shrink-0 flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                      style={{ background: step.color }}
                    >
                      <step.icon size={22} className="text-white" />
                    </div>
                    <div
                      className="w-0.5 flex-1 mt-3 rounded-full"
                      style={{ background: 'rgba(22,50,79,0.1)', minHeight: 24 }}
                    />
                  </div>
                  {/* Step content */}
                  <div className="pb-2">
                    <div
                      className="text-xs font-bold uppercase tracking-widest mb-1"
                      style={{ color: step.color, opacity: 0.7 }}
                    >
                      Step {step.number}
                    </div>
                    <h3 className="font-serif font-bold text-xl text-primary mb-2">{step.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FEATURES GRID
      ═════════════════════════════════════════════════════════════════════ */}
      <section
        id="features"
        className="py-24 px-6"
        style={{ background: 'linear-gradient(180deg, #fff 0%, #F7F8FC 100%)' }}
        aria-labelledby="features-heading"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-label mb-4">Packed with power</div>
            <h2
              id="features-heading"
              className="font-serif font-bold text-primary mb-4"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}
            >
              Everything you need to review safely
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Clarivo gives you the same insights a lawyer would — instantly.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="feature-card">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: feat.bg }}
                >
                  <feat.icon size={24} style={{ color: feat.color }} />
                </div>
                <h3 className="font-serif font-bold text-lg text-primary mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          UPLOAD SECTION
      ═════════════════════════════════════════════════════════════════════ */}
      <section
        id="upload"
        className="py-24 px-6"
        style={{ background: 'linear-gradient(135deg, #060d1a 0%, #0a1628 50%, #16324F 100%)' }}
        aria-labelledby="upload-heading"
      >
        <div className="max-w-3xl mx-auto text-center">
          {/* Decorative orbs */}
          <div className="orb-gold" style={{ width: 400, height: 400, top: '-20%', right: '5%', opacity: 0.12 }} />

          <div className="section-label mb-5 animate-fade-up">Get started now</div>
          <h2
            id="upload-heading"
            className="font-serif font-bold text-white mb-4 animate-fade-up-d1"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
          >
            Ready to understand your contract?
          </h2>
          <p
            className="text-lg mb-10 animate-fade-up-d1"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            Drop your legal document below. Analysis starts immediately.
          </p>

          {/* Upload card */}
          <div
            className="animate-fade-up-d2 rounded-2xl p-8"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <UploadPanel
              onUpload={onUpload}
              loading={loading}
              error={error}
              label="Select document to analyze"
            />

            {/* Accepted formats */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {['PDF', 'DOCX', 'TXT', 'Max 10 MB'].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap gap-6 justify-center mt-8 animate-fade-up-d3">
            {[
              { icon: CheckCircle2, text: 'No sign-up required' },
              { icon: CheckCircle2, text: 'Data not stored after analysis' },
              { icon: CheckCircle2, text: 'Results in under 30 seconds' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <item.icon size={14} style={{ color: '#4B7B62' }} />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          ABOUT SECTION
      ═════════════════════════════════════════════════════════════════════ */}
      <section
        id="about"
        className="py-24 px-6 bg-bg"
        aria-labelledby="about-heading"
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <div className="section-label mb-5">About Clarivo</div>
              <h2
                id="about-heading"
                className="font-serif font-bold text-primary mb-6"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)' }}
              >
                Making legal understanding accessible to everyone
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Legal documents are written to protect companies, not individuals.
                  Buried in dense legalese are clauses that can bind you to unfair terms,
                  unlimited liability, or non-compete restrictions.
                </p>
                <p>
                  Clarivo was built to fix that. Using Google&apos;s Gemini AI, it reads every
                  word of your contract and surfaces the risks that matter &mdash; in plain English.
                </p>
                <p>
                  We believe everyone deserves to understand what they sign, regardless of
                  whether they can afford a lawyer.
                </p>
              </div>
            </div>

            {/* Facts grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: '50+', label: 'Risk patterns', desc: 'Detected across NDA and vendor agreements' },
                { number: '< 30s', label: 'Analysis speed', desc: 'From upload to complete review' },
                { number: '100%', label: 'Private', desc: 'Documents processed in-memory, never stored' },
                { number: 'Free', label: 'No paywall', desc: 'Full analysis, no credit card needed' },
              ].map((fact) => (
                <div
                  key={fact.number}
                  className="rounded-2xl p-5 border"
                  style={{ background: 'linear-gradient(135deg, rgba(22,50,79,0.04), rgba(201,154,46,0.03))', borderColor: 'rgba(22,50,79,0.08)' }}
                >
                  <div
                    className="font-serif font-bold text-2xl mb-1"
                    style={{ background: 'linear-gradient(135deg, #16324F, #C99A2E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                  >
                    {fact.number}
                  </div>
                  <div className="font-semibold text-primary text-sm mb-1">{fact.label}</div>
                  <div className="text-xs text-gray-400 leading-snug">{fact.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
