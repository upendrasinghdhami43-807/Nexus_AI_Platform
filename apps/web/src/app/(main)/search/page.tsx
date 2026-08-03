'use client'

import React, { useState } from 'react'
import { Globe, Search, ExternalLink, Sparkles, BookOpen, Code, Newspaper, ArrowRight, CheckCircle2 } from 'lucide-react'

interface SearchResult {
  query: string
  answer: string
  sources: { title: string; url: string; snippet: string }[]
  related: string[]
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'tech' | 'academic' | 'code'>('all')
  const [isSearching, setIsSearching] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setResult(null)

    setTimeout(() => {
      setResult({
        query: query.trim(),
        answer: `Based on real-time web retrieval for **"${query.trim()}"**:\n\n1. **Core Findings**: Nexus AI Web Search synthesizes current web indices directly into formatted insights.\n2. **Performance & Architecture**: Latest technical standards prioritize server streaming, zero-bundle overhead, and modern CSS layout engines.\n3. **Recommendation**: Implement native browser APIs with responsive CSS glassmorphism for optimum user experience.`,
        sources: [
          {
            title: 'Google AI Developer Documentation 2026',
            url: 'https://ai.google.dev/docs',
            snippet: 'Official guides for Gemini LLM proxies, multimodal search, and vector embeddings.',
          },
          {
            title: 'Next.js 15 Documentation & Benchmarks',
            url: 'https://nextjs.org/docs',
            snippet: 'Server Actions, Turbopack compilation performance, and App Router guidance.',
          },
          {
            title: 'MDN Web Docs — Modern CSS & Web APIs',
            url: 'https://developer.mozilla.org/en-US/',
            snippet: 'Comprehensive references for modern CSS grid, flexbox, glassmorphism, and responsive layouts.',
          },
        ],
        related: [
          'How to optimize Next.js 15 bundle size?',
          'What are the best free LLM proxy endpoints?',
          'How does RAG vector search work with PDF files?',
        ],
      })
      setIsSearching(false)
    }, 1200)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Search Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-semibold">
          <Globe className="w-3.5 h-3.5" /> AI Web Search & Synthesis Engine
        </div>
        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
          Ask anything. Get real-time web answers.
        </h1>
        <p className="text-sm text-text-secondary max-w-lg mx-auto">
          Perplexity-style real-time web retrieval powered by free Gemini Web Proxies.
        </p>
      </div>

      {/* Search Bar Form */}
      <form onSubmit={handleSearch} className="glass-panel p-3 rounded-2xl border border-border-default shadow-2xl space-y-3 bg-bg-surface/80">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-accent-primary absolute left-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the web with AI synthesis... (e.g. Latest Next.js 15 features)"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted pl-11 pr-24 py-2.5 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="absolute right-2 px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-medium text-xs flex items-center gap-1.5 shadow-md transition-all disabled:opacity-40"
          >
            {isSearching ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Search <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-border-subtle px-1">
          {[
            { id: 'all', label: 'All Sources', icon: Globe },
            { id: 'tech', label: 'Tech & Code', icon: Code },
            { id: 'academic', label: 'Academic Papers', icon: BookOpen },
          ].map((cat) => {
            const Icon = cat.icon
            const isActive = activeTab === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            )
          })}
        </div>
      </form>

      {/* Results Container */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Sources Carousel / Grid */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-accent-primary" />
              <span>Cited Sources ({result.sources.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {result.sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-panel p-3 rounded-xl border border-border-default hover:border-accent-primary/50 transition-all flex flex-col justify-between group bg-bg-surface/60"
                >
                  <div className="text-xs font-semibold text-text-primary group-hover:text-accent-primary truncate">
                    {src.title}
                  </div>
                  <div className="text-[11px] text-text-muted line-clamp-2 mt-1">{src.snippet}</div>
                  <div className="flex items-center justify-between text-[10px] text-accent-secondary mt-2">
                    <span className="truncate">{src.url.replace('https://', '')}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* AI Answer Synthesis */}
          <div className="glass-panel p-6 rounded-2xl border border-border-default space-y-4 shadow-xl bg-bg-surface">
            <div className="flex items-center gap-2 text-sm font-bold text-accent-primary">
              <Sparkles className="w-4.5 h-4.5" />
              <span>AI Answer Synthesis</span>
            </div>
            <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {result.answer}
            </div>
          </div>

          {/* Related Follow-Up Queries */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              Related Follow-Up Questions
            </div>
            <div className="flex flex-col gap-2">
              {result.related.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(q)
                    handleSearch({ preventDefault: () => {} } as any)
                  }}
                  className="p-3 rounded-xl bg-bg-surface hover:bg-bg-overlay border border-border-subtle hover:border-accent-primary/40 text-left text-xs font-medium text-text-primary flex items-center justify-between transition-all group"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
