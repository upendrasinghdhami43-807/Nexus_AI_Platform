'use client'

import React from 'react'
import { ModelSelector } from '@/components/chat/ModelSelector'
import { Share2, Sparkles } from 'lucide-react'

interface NavbarProps {
  title?: string
}

export function Navbar({ title = 'New Conversation' }: NavbarProps) {
  return (
    <header className="h-14 border-b border-border-subtle bg-bg-base/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h1 className="font-semibold text-sm text-text-primary truncate max-w-xs md:max-w-md">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <ModelSelector />
        
        <button 
          aria-label="Share Conversation"
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-colors border border-border-subtle flex items-center gap-1.5 text-xs font-medium"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>
    </header>
  )
}
