'use client'

import React, { useState } from 'react'
import { Send, Paperclip, Globe, Mic } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSend, isLoading = false }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isWebSearchActive, setIsWebSearchActive] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSend(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto w-full px-4 mb-4">
      <div className="relative glass-panel p-2 shadow-2xl focus-within:border-accent-primary/50 transition-colors">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Nexus AI anything... (Shift+Enter for new line)"
          rows={1}
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none px-2 py-1 max-h-32"
        />

        <div className="flex items-center justify-between pt-2 border-t border-border-subtle mt-1 px-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Attach File"
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-overlay transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsWebSearchActive(!isWebSearchActive)}
              aria-label="Toggle Web Search"
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                isWebSearchActive
                  ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-overlay'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Web Search</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send Message"
            className="p-2 rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  )
}
