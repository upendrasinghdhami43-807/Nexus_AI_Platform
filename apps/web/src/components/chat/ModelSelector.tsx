'use client'

import React, { useState } from 'react'
import { ChevronDown, Zap, Lock, Sparkles } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

const MODELS = [
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'Free Proxy', cost: 'free' },
  { id: 'gemini-3.5-flash-thinking', name: 'Gemini 3.5 Thinking (20k)', provider: 'Free Proxy', cost: 'free' },
  { id: 'gemini-flash-lite', name: 'Gemini Flash Lite', provider: 'Free Proxy', cost: 'free' },
  { id: 'gpt-4o', name: 'GPT-4o (OpenAI)', provider: 'API Key', cost: 'paid' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'API Key', cost: 'paid' },
]

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { selectedModel, setSelectedModel } = useUIStore()

  const current = MODELS.find((m) => m.id === selectedModel) || MODELS[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select AI Model"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-surface border border-border-default hover:border-border-strong text-xs font-medium text-text-primary transition-all shadow-sm"
      >
        <Sparkles className="w-3.5 h-3.5 text-accent-primary" />
        <span>{current.name}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-primary/10 text-accent-primary font-semibold">
          {current.cost.toUpperCase()}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-bg-elevated border border-border-default shadow-xl z-50 p-1.5 space-y-1">
          <div className="px-2 py-1 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            Available Models
          </div>
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model.id)
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                selectedModel === model.id
                  ? 'bg-accent-primary/15 text-accent-primary'
                  : 'text-text-primary hover:bg-bg-overlay'
              }`}
            >
              <div className="flex items-center gap-2">
                {model.cost === 'free' ? (
                  <Zap className="w-3.5 h-3.5 text-accent-secondary" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-text-muted" />
                )}
                <span>{model.name}</span>
              </div>
              <span className="text-[10px] text-text-muted">{model.provider}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
