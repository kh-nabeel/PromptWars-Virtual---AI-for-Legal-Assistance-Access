/**
 * App.tsx — root component.
 *
 * State machine:
 *   idle → uploading → uploaded (shows DocumentReader with inline highlights)
 *
 * Summary and Risk are fetched in parallel after upload.
 */
import { useState, useCallback, useRef } from 'react'
import {
  uploadDocument,
  getSummary,
  getRisks,
  type UploadResponse,
  type SummaryResponse,
  type RiskResponse,
} from './api/client'
import { HomePage } from './components/HomePage'
import { DocumentReader } from './components/DocumentReader'
import { Header } from './components/Header'
import { Footer } from './components/Footer'

export default function App() {
  // Upload state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [session, setSession] = useState<UploadResponse | null>(null)

  // Analysis data
  const [summary, setSummary] = useState<SummaryResponse | null>(null)
  const [risks, setRisks] = useState<RiskResponse | null>(null)

  // Ref to scroll to reader after upload
  const readerRef = useRef<HTMLDivElement>(null)

  // ── Upload handler ──────────────────────────────────────────────────────
  async function handleUpload(file: File) {
    setUploading(true)
    setUploadError(null)
    setSummary(null)
    setRisks(null)
    try {
      const result = await uploadDocument(file)
      setSession(result)
      // Immediately kick off analysis fetchers
      fetchSummary(result.session_id)
      fetchRisks(result.session_id)
      // Scroll to top so user sees reader
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Upload failed. Please try again.'
      setUploadError(msg)
    } finally {
      setUploading(false)
    }
  }

  // ── Lazy fetchers ───────────────────────────────────────────────────────
  const fetchSummary = useCallback(async (sid: string) => {
    try {
      const data = await getSummary(sid)
      setSummary(data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  const fetchRisks = useCallback(async (sid: string) => {
    try {
      const data = await getRisks(sid)
      setRisks(data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  function handleReset() {
    setSession(null)
    setSummary(null)
    setRisks(null)
    setUploadError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToUpload = () => {
    document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* ── Sticky Header ── */}
      <Header
        hasSession={!!session}
        onReset={handleReset}
        onAnalyzeClick={scrollToUpload}
      />

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col" ref={readerRef}>
        {!session ? (
          /* ── Home page (landing) ── */
          <HomePage
            onUpload={handleUpload}
            loading={uploading}
            error={uploadError}
          />
        ) : (
          /* ── Analysis / Document Reader ── */
          <div className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-8 animate-fade-in">
            <DocumentReader session={session} summary={summary} risks={risks} />
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  )
}
