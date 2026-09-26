/**
 * UploadPanel — drag-and-drop / click to upload a legal document.
 * Accepts PDF, DOCX, TXT up to 10 MB.
 * Shows upload progress and clear error messages.
 */
import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { Upload, FileText, X, Loader2 } from 'lucide-react'

interface Props {
  onUpload: (file: File) => void
  loading: boolean
  error: string | null
  label?: string
}

const ACCEPTED = '.pdf,.docx,.txt'
const MAX_BYTES = 10 * 1024 * 1024

export function UploadPanel({ onUpload, loading, error, label = 'Upload Document' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  function validateAndUpload(file: File) {
    setLocalError(null)
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'docx', 'txt'].includes(ext ?? '')) {
      setLocalError('Please upload a PDF, DOCX, or TXT file.')
      return
    }
    if (file.size > MAX_BYTES) {
      setLocalError('File is too large. Maximum size is 10 MB.')
      return
    }
    onUpload(file)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndUpload(file)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) validateAndUpload(file)
  }

  const displayError = localError ?? error

  return (
    <div className="space-y-3 w-full">
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        onClick={() => !loading && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !loading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`upload-zone ${dragging ? 'dragging' : ''} ${loading ? 'loading' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          id={`upload-input-${label.replace(/\s/g, '-')}`}
          accept={ACCEPTED}
          onChange={handleChange}
          className="sr-only"
          aria-label={label}
          disabled={loading}
        />

        {loading ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="text-primary animate-spin" size={32} aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-primary">Analysing document…</p>
              <p className="text-sm text-gray-400 mt-1">This may take 15–30 seconds</p>
            </div>
          </>
        ) : (
          <>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-all duration-200"
              style={{ background: dragging ? 'linear-gradient(135deg, #C99A2E, #dfae36)' : '#16324F' }}
            >
              {dragging ? (
                <FileText className="text-white" size={28} aria-hidden="true" />
              ) : (
                <Upload className="text-white" size={28} aria-hidden="true" />
              )}
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-primary">
                {dragging ? 'Drop to upload' : label}
              </p>
              <p className="text-sm text-gray-400 mt-1">PDF, DOCX, or TXT · Max 10 MB</p>
              <p className="text-xs text-gray-300 mt-2">or drag & drop your file here</p>
            </div>
          </>
        )}
      </div>

      {/* Error message */}
      {displayError && (
        <div
          role="alert"
          className="flex items-start gap-2 px-4 py-3 rounded-xl
                     bg-red-50 border border-red-200 text-red-800 text-sm"
        >
          <X size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  )
}
