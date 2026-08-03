'use client'

import React, { useState, useRef } from 'react'
import { Send, Paperclip, Globe, X, FileText, Image as ImageIcon, FileCode, CheckCircle2 } from 'lucide-react'

export interface AttachedFile {
  id: string
  name: string
  size: string
  type: string
}

interface ChatInputProps {
  onSend: (message: string, attachments: AttachedFile[], webSearch: boolean) => void
  isLoading?: boolean
}

export function ChatInput({ onSend, isLoading = false }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isWebSearchActive, setIsWebSearchActive] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const files = Array.from(e.target.files)
    const newAttachments: AttachedFile[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: file.type,
    }))
    setAttachedFiles((prev) => [...prev, ...newAttachments])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return
    onSend(input.trim(), attachedFiles, isWebSearchActive)
    setInput('')
    setAttachedFiles([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(ext || '')) return <ImageIcon className="w-3.5 h-3.5 text-accent-secondary" />
    if (['ts', 'tsx', 'js', 'py', 'json', 'html', 'css'].includes(ext || '')) return <FileCode className="w-3.5 h-3.5 text-accent-primary" />
    return <FileText className="w-3.5 h-3.5 text-text-secondary" />
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto w-full px-4 mb-4">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.json,.ts,.js,.py,.csv"
      />

      <div className="relative glass-panel p-3 shadow-2xl focus-within:border-accent-primary/50 transition-all rounded-2xl border border-border-default bg-bg-surface/80 backdrop-blur-xl">
        {/* Attached Files Bar */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 pb-2 border-b border-border-subtle">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-bg-overlay border border-border-subtle text-xs text-text-primary"
              >
                {getFileIcon(file.name)}
                <span className="truncate max-w-[140px] font-medium">{file.name}</span>
                <span className="text-[10px] text-text-muted">({file.size})</span>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="p-0.5 rounded hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Nexus AI anything... (Shift+Enter for new line)"
          rows={1}
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none px-2 py-1 max-h-36"
        />

        <div className="flex items-center justify-between pt-2 border-t border-border-subtle mt-1 px-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Attach File"
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-overlay transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <Paperclip className="w-4 h-4 text-accent-primary" />
              <span className="hidden sm:inline">Attach</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWebSearchActive(!isWebSearchActive)}
              aria-label="Toggle Web Search"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                isWebSearchActive
                  ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/40 shadow-sm'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-overlay'
              }`}
            >
              <Globe className={`w-4 h-4 ${isWebSearchActive ? 'text-accent-primary animate-pulse' : ''}`} />
              <span>Web Search</span>
              {isWebSearchActive && <CheckCircle2 className="w-3 h-3 text-accent-primary" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
            aria-label="Send Message"
            className="p-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  )
}
