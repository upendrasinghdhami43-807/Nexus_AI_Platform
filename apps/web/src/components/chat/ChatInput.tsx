'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  ArrowUp,
  Plus,
  Globe,
  X,
  FileText,
  Image as ImageIcon,
  FileCode,
  Mic,
  AudioLines,
  Paperclip,
  Check,
  Square,
} from 'lucide-react'

export interface AttachedFile {
  id: string
  name: string
  size: string
  type: string
}

interface ChatInputProps {
  onSend: (message: string, attachments: AttachedFile[], webSearch: boolean) => void
  isLoading?: boolean
  onStop?: () => void
}

export function ChatInput({ onSend, isLoading = false, onStop }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isWebSearchActive, setIsWebSearchActive] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }, [input])

  // Close + menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    setIsMenuOpen(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return
    onSend(input.trim(), attachedFiles, isWebSearchActive)
    setInput('')
    setAttachedFiles([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const toggleVoiceMode = () => {
    setIsListening(!isListening)
    if (!isListening) {
      // Simulate quick voice dictation placeholder
      setInput((prev) => (prev ? prev + ' ' : '') + 'Create a responsive web component')
      setTimeout(() => setIsListening(false), 2000)
    }
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'svg', 'webp'].includes(ext || '')) return <ImageIcon className="w-3.5 h-3.5 text-accent-secondary" />
    if (['ts', 'tsx', 'js', 'py', 'json', 'html', 'css'].includes(ext || '')) return <FileCode className="w-3.5 h-3.5 text-accent-primary" />
    return <FileText className="w-3.5 h-3.5 text-text-secondary" />
  }

  const isCanSend = (input.trim().length > 0 || attachedFiles.length > 0) && !isLoading

  return (
    <div className="relative max-w-3xl mx-auto w-full px-2 sm:px-4 mb-3 sm:mb-4">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg,.json,.ts,.js,.py,.csv"
      />

      {/* Main Pill Input Container (ChatGPT Mobile & Desktop Pill Bar) */}
      <div className="relative bg-bg-surface/90 border border-border-default shadow-xl rounded-[28px] p-2 sm:p-2.5 transition-all focus-within:border-border-strong focus-within:shadow-2xl backdrop-blur-xl">
        {/* Attached Files Bar inside pill */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-2 pt-1 pb-2 mb-1 border-b border-border-subtle">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-elevated border border-border-subtle text-xs text-text-primary"
              >
                {getFileIcon(file.name)}
                <span className="truncate max-w-[130px] font-medium text-xs">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="p-0.5 rounded-full hover:bg-bg-overlay text-text-muted hover:text-text-primary transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Text Area Row */}
        <div className="flex items-center gap-2">
          {/* Plus (+) Button & Popover Tool Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Add attachment or tool"
              className="w-9 h-9 rounded-full bg-bg-elevated hover:bg-bg-overlay text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors flex-shrink-0 border border-border-subtle"
            >
              <Plus className={`w-5 h-5 transition-transform duration-200 ${isMenuOpen ? 'rotate-45' : ''}`} />
            </button>

            {/* Plus Popover Menu */}
            {isMenuOpen && (
              <div className="absolute bottom-12 left-0 w-56 rounded-2xl bg-bg-surface border border-border-default shadow-2xl z-50 p-1.5 space-y-1 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-text-primary hover:bg-bg-elevated transition-colors"
                >
                  <Paperclip className="w-4 h-4 text-accent-primary" />
                  <span>Upload File / Document</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsWebSearchActive(!isWebSearchActive)
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-text-primary hover:bg-bg-elevated transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className={`w-4 h-4 ${isWebSearchActive ? 'text-accent-secondary' : 'text-text-muted'}`} />
                    <span>Search the web</span>
                  </div>
                  {isWebSearchActive && <Check className="w-3.5 h-3.5 text-accent-secondary" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInput('Create an image: ')
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-text-primary hover:bg-bg-elevated transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <span>Create an image</span>
                </button>
              </div>
            )}
          </div>

          {/* Flexible Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            rows={1}
            className="flex-1 bg-transparent text-sm sm:text-base text-text-primary placeholder:text-text-muted placeholder:font-normal resize-none focus:outline-none py-1.5 px-1 max-h-40 leading-normal"
          />

          {/* Right Action Icons: Web Search Badge, Voice/Mic, Send Button */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Active Web Search Badge Pill */}
            {isWebSearchActive && (
              <button
                type="button"
                onClick={() => setIsWebSearchActive(false)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/30 text-[11px] font-semibold"
              >
                <Globe className="w-3 h-3 animate-pulse" />
                <span>Search</span>
                <X className="w-3 h-3 hover:text-text-primary" />
              </button>
            )}

            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleVoiceMode}
              aria-label="Voice Input"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                isListening
                  ? 'bg-rose-500/20 text-rose-500 animate-pulse border border-rose-500/30'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-overlay'
              }`}
            >
              <Mic className="w-4.5 h-4.5" />
            </button>

            {/* Voice Waveform / Audio Button (ChatGPT style) */}
            <button
              type="button"
              onClick={toggleVoiceMode}
              aria-label="Audio Mode"
              className="w-9 h-9 rounded-full bg-text-primary text-bg-base flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              <AudioLines className="w-4.5 h-4.5" />
            </button>

            {/* Stop button (shown while streaming) */}
            {isLoading && onStop ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop generating"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 transition-all active:scale-95"
              >
                <Square className="w-4 h-4 fill-red-400" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!isCanSend}
                aria-label="Send Message"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isCanSend
                    ? 'bg-accent-primary text-white shadow-md active:scale-95 cursor-pointer'
                    : 'bg-bg-elevated text-text-muted opacity-40 cursor-not-allowed border border-border-subtle'
                }`}
              >
                <ArrowUp className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
