/**
 * Typed API client using Axios.
 * All API calls go through this module — baseURL from env or default.
 * Never sends document text from the client after initial upload.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000, // LLM calls can take a while
})

// ─── Types (mirroring backend Pydantic models) ──────────────────────────────

export interface ClassificationResult {
  doc_type: string
  label: string
  confidence: number
  reason: string
  low_confidence: boolean
}

export interface UploadResponse {
  session_id: string
  filename: string
  char_count: number
  classification: ClassificationResult
  text: string
}

export interface SummarySection {
  title: string
  content: string
}

export interface SummaryResponse {
  session_id: string
  doc_type: string
  sections: SummarySection[]
}

export interface RiskItem {
  id: string
  label: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH'
  found: boolean
  excerpt: string | null
  plain_reason: string
}

export interface RiskResponse {
  session_id: string
  doc_type: string
  items: RiskItem[]
  no_risks_found: boolean
}

export interface ComparisonDiff {
  section: string
  change_type: 'ADDED' | 'REMOVED' | 'CHANGED' | 'UNCHANGED'
  doc_a_text: string | null
  doc_b_text: string | null
  verdict: 'BETTER' | 'WORSE' | 'NEUTRAL' | 'UNCHANGED'
  explanation: string
}

export interface CompareResponse {
  session_id_a: string
  session_id_b: string
  doc_type: string
  diffs: ComparisonDiff[]
  overall_verdict: string
}

export interface ChatResponse {
  answer: string
  found_in_document: boolean
}

export interface ExportResponse {
  session_id: string
  doc_type: string
  checklist: string[]
  lawyer_questions: string[]
}

export interface CorrectTypeResponse {
  session_id: string
  doc_type: string
  label: string
  message: string
}

// ─── API functions ───────────────────────────────────────────────────────────

export const ALL_DOC_TYPES = [
  { value: 'VENDOR',     label: 'Vendor / Supplier Agreement' },
  { value: 'NDA',        label: 'Non-Disclosure Agreement (NDA)' },
  { value: 'OTHER',      label: 'Other / Unrecognized' },
]

export async function uploadDocument(file: File): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<UploadResponse>('/api/upload', form)
  return data
}

export async function getSummary(sessionId: string): Promise<SummaryResponse> {
  const { data } = await api.get<SummaryResponse>(`/api/analysis/${sessionId}/summary`)
  return data
}

export async function getRisks(sessionId: string): Promise<RiskResponse> {
  const { data } = await api.get<RiskResponse>(`/api/analysis/${sessionId}/risks`)
  return data
}

export async function correctType(
  sessionId: string,
  correctedType: string,
): Promise<CorrectTypeResponse> {
  const { data } = await api.post<CorrectTypeResponse>('/api/correct-type', {
    session_id: sessionId,
    corrected_type: correctedType,
  })
  return data
}

export async function compareDocuments(
  sessionIdA: string,
  fileB: File,
): Promise<CompareResponse> {
  const form = new FormData()
  form.append('session_id_a', sessionIdA)
  form.append('file_b', fileB)
  const { data } = await api.post<CompareResponse>('/api/compare', form)
  return data
}

export async function sendChatMessage(
  sessionId: string,
  message: string,
  sessionIdB?: string,
): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>('/api/chat', {
    session_id: sessionId,
    message,
    session_id_b: sessionIdB ?? null,
  })
  return data
}

export async function getExport(sessionId: string): Promise<ExportResponse> {
  const { data } = await api.get<ExportResponse>(`/api/export/${sessionId}`)
  return data
}
