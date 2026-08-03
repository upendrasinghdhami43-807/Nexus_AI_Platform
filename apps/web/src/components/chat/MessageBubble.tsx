'use client'

import React, { useState, useEffect } from 'react'
import { Copy, Bot, User as UserIcon, Globe, FileText, ExternalLink, Check, Volume2, VolumeX, Square } from 'lucide-react'
import { AttachedFile } from './ChatInput'

export interface SearchSource {
  title: string
  url: string
  snippet: string
}

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  model?: string
  isStreaming?: boolean
  attachments?: AttachedFile[]
  webSearchSources?: SearchSource[]
}

export function MessageBubble({
  role,
  content,
  model,
  isStreaming,
  attachments,
  webSearchSources,
}: MessageBubbleProps) {
  const isUser = role === 'user'
  const [copied, setCopied] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReadAloud = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }

    window.speechSynthesis.cancel()

    // Clean text of markdown formatting for natural speech
    const cleanText = content
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_#~]/g, '')

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    setIsPlaying(true)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className={`flex gap-3 p-4 rounded-xl max-w-3xl mx-auto w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-accent-primary/20 text-accent-primary flex items-center justify-center flex-shrink-0 mt-1 border border-accent-primary/30 shadow-md">
          <Bot className="w-4.5 h-4.5" />
        </div>
      )}

      <div className={`flex flex-col gap-2 max-w-[88%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Attachments Preview */}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-elevated border border-border-default text-xs text-text-primary shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-accent-primary" />
                <span className="font-medium truncate max-w-[160px]">{file.name}</span>
                <span className="text-[10px] text-text-muted">({file.size})</span>
              </div>
            ))}
          </div>
        )}

        {/* Web Search Sources Badge */}
        {!isUser && webSearchSources && webSearchSources.length > 0 && (
          <div className="w-full glass-panel p-3 rounded-xl border border-accent-primary/20 bg-accent-primary/5 space-y-2 mb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-accent-primary">
              <Globe className="w-3.5 h-3.5" />
              <span>Searched 4 web sources</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {webSearchSources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-bg-surface border border-border-subtle hover:border-accent-primary/40 transition-all flex flex-col justify-between group"
                >
                  <div className="text-xs font-medium text-text-primary group-hover:text-accent-primary truncate">
                    {src.title}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-text-muted mt-1">
                    <span className="truncate max-w-[120px]">{src.url.replace('https://', '')}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Message Content */}
        <div
          className={`px-4.5 py-3.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-accent-primary text-white rounded-tr-none shadow-lg'
              : 'glass-panel text-text-primary rounded-tl-none border border-border-default shadow-md'
          }`}
        >
          <div className="whitespace-pre-wrap">{content}</div>
          {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-accent-primary animate-pulse" />}
        </div>

        {/* Footer Actions */}
        {!isUser && (
          <div className="flex items-center gap-3.5 mt-1 text-[11px] text-text-muted px-1">
            <span>{model || 'Gemini 3.5 Flash'}</span>

            {/* Read Aloud TTS Button */}
            <button
              onClick={handleReadAloud}
              aria-label={isPlaying ? 'Stop Reading' : 'Read Aloud'}
              className={`flex items-center gap-1 font-medium transition-colors ${
                isPlaying ? 'text-accent-primary animate-pulse' : 'hover:text-text-primary'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-3 h-3 fill-accent-primary" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3 h-3 text-accent-primary" />
                  <span>Read Aloud</span>
                </>
              )}
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              aria-label="Copy response"
              className="flex items-center gap-1 hover:text-text-primary transition-colors font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-bg-elevated text-text-secondary flex items-center justify-center flex-shrink-0 mt-1 border border-border-subtle shadow-md">
          <UserIcon className="w-4.5 h-4.5" />
        </div>
      )}
    </div>
  )
}
