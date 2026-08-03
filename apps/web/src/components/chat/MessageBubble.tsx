'use client'

import React from 'react'
import { Copy, RefreshCw, Bot, User as UserIcon } from 'lucide-react'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
  model?: string
  isStreaming?: boolean
}

export function MessageBubble({ role, content, model, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <div className={`flex gap-4 p-4 rounded-xl max-w-3xl mx-auto w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-accent-primary/20 text-accent-primary flex items-center justify-center flex-shrink-0 mt-1 border border-accent-primary/30">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-accent-primary text-white rounded-br-none shadow-lg'
              : 'glass-panel text-text-primary rounded-bl-none border border-border-default'
          }`}
        >
          <div className="whitespace-pre-wrap">{content}</div>
          {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-accent-primary animate-pulse" />}
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 mt-1 text-[10px] text-text-muted">
            <span>{model || 'Gemini 3.5 Flash'}</span>
            <button
              onClick={() => navigator.clipboard.writeText(content)}
              aria-label="Copy response"
              className="hover:text-text-primary transition-colors"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-bg-elevated text-text-secondary flex items-center justify-center flex-shrink-0 mt-1 border border-border-subtle">
          <UserIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  )
}
