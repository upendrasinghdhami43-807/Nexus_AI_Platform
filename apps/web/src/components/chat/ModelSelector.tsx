'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Zap, Lock, Sparkles, Check } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

const MODELS = [
  { id: 'gemini-3.5-flash', name: 'Nexus AI 3.5', tag: 'Fast & Smart', cost: 'free' },
  { id: 'gemini-3.5-flash-thinking', name: 'Nexus AI 3.5 Thinking', tag: 'Deep Reasoning', cost: 'free' },
  { id: 'gemini-flash-lite', name: 'Nexus AI Lite', tag: 'Ultra Fast', cost: 'free' },
  { id: 'gpt-4o', name: 'GPT-4o (OpenAI)', tag: 'API Key', cost: 'paid' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', tag: 'API Key', cost: 'paid' },
]

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { selectedModel, setSelectedModel } = useUIStore()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const current = MODELS.find((m) => m.id === selectedModel) || MODELS[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select AI Model"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-semibold text-text-primary hover:bg-bg-overlay/60 transition-colors"
      >
        <span>{current.name}</span>
        <ChevronDown className="w-4 h-4 text-text-muted stroke-[2.5]" />
      </button>

      {isOpen && (
        <div className="absolute left-0 lg:left-0 right-auto mt-2 w-64 rounded-2xl bg-bg-surface border border-border-default shadow-2xl z-50 p-2 space-y-1 animate-fadeIn">
          <div className="px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Model Version
          </div>
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model.id)
                setIsOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                selectedModel === model.id
                  ? 'bg-bg-elevated text-text-primary font-semibold'
                  : 'text-text-secondary hover:bg-bg-overlay hover:text-text-primary'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className={`w-4 h-4 ${selectedModel === model.id ? 'text-accent-primary' : 'text-text-muted'}`} />
                <div className="flex flex-col text-left">
                  <span>{model.name}</span>
                  <span className="text-[10px] text-text-muted">{model.tag}</span>
                </div>
              </div>
              {selectedModel === model.id && <Check className="w-4 h-4 text-accent-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
