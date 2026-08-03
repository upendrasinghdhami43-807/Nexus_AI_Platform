'use client'

import React, { useState } from 'react'
import { Globe, Search, ExternalLink } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) setHasSearched(true)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 text-accent-primary flex items-center justify-center mx-auto border border-accent-primary/20">
          <Globe className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Perplexity-Style Web Search</h1>
        <p className="text-xs text-text-secondary">Search the live web and get synthesized answers with direct citations.</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything about recent events, tech, or research..."
          className="w-full glass-panel px-4 py-3.5 pl-11 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary"
        />
        <Search className="w-4 h-4 text-text-muted absolute left-4 top-4" />
      </form>

      {hasSearched && (
        <div className="glass-panel p-6 space-y-4 border border-border-default">
          <h3 className="text-xs font-semibold text-accent-primary uppercase tracking-wider">AI Web Summary</h3>
          <p className="text-sm text-text-primary leading-relaxed">
            Here are the latest findings regarding <strong>"{query}"</strong> gathered from live web search indices.
          </p>

          <div className="pt-4 border-t border-border-subtle">
            <h4 className="text-xs font-semibold text-text-secondary mb-2">Sources</h4>
            <div className="flex gap-2">
              <span className="text-xs glass-panel px-3 py-1.5 flex items-center gap-1 text-text-secondary">
                GitHub Docs <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
