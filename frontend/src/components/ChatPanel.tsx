/**
 * ChatPanel — grounded Q&A over the uploaded document(s).
 * Clearly indicates when the answer was not found in the document.
 */
import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { MessageSquare, Send, AlertCircle, Loader2 } from 'lucide-react'
import { sendChatMessage } from '../api/client'

interface Message {
  role: 'user' | 'assistant'
  content: string
  foundInDocument?: boolean
}

interface Props {
  sessionId: string
  sessionIdB?: string
}

export function ChatPanel({ sessionId, sessionIdB }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await sendChatMessage(sessionId, text, sessionIdB)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          foundInDocument: response.found_in_document,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          foundInDocument: false,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-surface text-ink relative p-4 pb-0">
      {/* Message history */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="flex-1 overflow-y-auto space-y-4 pr-2 pb-24"
      >
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-30 text-primary" aria-hidden="true" />
            <p>Ask anything about the document.</p>
            <p className="text-xs mt-1 text-gray-400">Answers are drawn only from the uploaded document.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-ink border border-gray-200'
              }`}
            >
              {msg.content}
              {/* Show warning when not found in document */}
              {msg.role === 'assistant' && msg.foundInDocument === false && (
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-200
                                text-xs text-amber-600">
                  <AlertCircle size={11} aria-hidden="true" />
                  Information not found in the document
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 border border-gray-200 rounded px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 size={14} className="animate-spin text-primary" aria-hidden="true" />
              Searching document…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="absolute bottom-0 left-0 right-0 bg-surface border-t border-gray-200 p-4">
        <div className="flex items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Ask a question about the document
          </label>
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. What is the notice period?"
            rows={2}
            maxLength={2000}
            className="flex-1 bg-white border border-gray-300 rounded px-3 py-2
                       text-sm text-ink placeholder-gray-400 resize-none
                       focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary
                       transition-colors"
            aria-label="Chat message input"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-primary hover:bg-navy-800 text-white rounded h-[52px] px-4 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send size={16} aria-hidden="true" />
          </button>
        </div>
        <p className="text-xs text-gray-400 text-right mt-1">
          Press Enter to send
        </p>
      </div>
    </div>
  )
}
