'use client'

import React, { useState } from 'react'
import { Sparkles, Copy, Check, ArrowRight, Plus, Search, Code, PenTool, Bot, Megaphone, Terminal, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PromptItem {
  id: string
  title: string
  category: 'coding' | 'writing' | 'agents' | 'marketing' | 'analysis'
  description: string
  promptText: string
  tags: string[]
}

export default function PromptsPage() {
  const router = useRouter()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newPromptText, setNewPromptText] = useState('')
  const [newCategory, setNewCategory] = useState<'coding' | 'writing' | 'agents' | 'marketing' | 'analysis'>('coding')

  const [prompts, setPrompts] = useState<PromptItem[]>([
    {
      id: '1',
      title: 'Senior Full-Stack Code Reviewer',
      category: 'coding',
      description: 'Reviews pull requests for security flaws, performance bottlenecks, and TypeScript best practices.',
      promptText: 'Act as a Senior Full-Stack Tech Lead. Thoroughly review the following code for architecture patterns, potential edge cases, security vulnerabilities, and state management optimization:\n\n```ts\n// Insert code here\n```',
      tags: ['TypeScript', 'Code Quality', 'Security'],
    },
    {
      id: '2',
      title: 'SEO-Optimized Tech Article Writer',
      category: 'writing',
      description: 'Generates engaging technical articles with clear headers, key takeaways, and keyword integration.',
      promptText: 'Write a comprehensive 1,200-word developer guide on [Topic]. Structure with clear H2/H3 headings, code snippets, visual diagrams in Mermaid format, and actionable summaries.',
      tags: ['Blogging', 'SEO', 'Technical Content'],
    },
    {
      id: '3',
      title: 'Autonomous System Architecture Architect',
      category: 'agents',
      description: 'Designs microservices, database schemas, and caching layers for high-throughput platforms.',
      promptText: 'Design a resilient distributed system for [System Goal]. Provide an architectural breakdown covering:\n1. API Gateway & Routing\n2. Database Schemas (PostgreSQL & Redis)\n3. Message Queue Topology (Kafka/RabbitMQ)\n4. Security & Authentication Flow',
      tags: ['System Design', 'Backend', 'DevOps'],
    },
    {
      id: '4',
      title: 'SaaS Value Proposition Copywriter',
      category: 'marketing',
      description: 'Crafts high-converting landing page headlines, hero sections, and feature bullet points.',
      promptText: 'Create 5 high-converting hero headlines, subheadings, and 3 primary call-to-action buttons for a new B2B AI SaaS platform targeting developers.',
      tags: ['Marketing', 'Copywriting', 'Conversion'],
    },
    {
      id: '5',
      title: 'SQL Performance & Query Optimizer',
      category: 'analysis',
      description: 'Analyzes slow SQL queries and suggests indexing strategies and query rewrites.',
      promptText: 'EXPLAIN ANALYZE the following PostgreSQL query and suggest indexed columns, JOIN optimizations, and CTE improvements:\n\nSELECT * FROM orders ...',
      tags: ['Database', 'SQL', 'Performance'],
    },
  ])

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleUsePrompt = (promptText: string) => {
    router.push(`/chat?prompt=${encodeURIComponent(promptText)}`)
  }

  const handleAddPrompt = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newPromptText.trim()) return

    const created: PromptItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTitle.trim(),
      category: newCategory,
      description: newPromptText.substring(0, 80) + '...',
      promptText: newPromptText.trim(),
      tags: [newCategory, 'Custom'],
    }

    setPrompts([created, ...prompts])
    setIsModalOpen(false)
    setNewTitle('')
    setNewPromptText('')
  }

  const filteredPrompts = prompts.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-border-default shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent-primary" />
            Prompt Library & Templates
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Curated prompt templates for engineering, copywriting, database optimization, and AI agents.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-medium text-sm flex items-center gap-2 shadow-lg transition-all self-start md:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          Create Prompt
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts by keyword..."
            className="w-full bg-bg-surface border border-border-default rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {['all', 'coding', 'writing', 'agents', 'marketing', 'analysis'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-accent-primary text-white shadow-md'
                  : 'bg-bg-surface text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPrompts.map((item) => (
          <div
            key={item.id}
            className="glass-panel p-5 rounded-2xl border border-border-default hover:border-accent-primary/40 transition-all flex flex-col justify-between space-y-4 shadow-md group bg-bg-surface/60"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-[11px] font-semibold uppercase tracking-wider">
                  {item.category}
                </span>
                <button
                  onClick={() => handleCopy(item.id, item.promptText)}
                  className="p-1.5 rounded-lg hover:bg-bg-overlay text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 text-xs"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-base font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">{item.description}</p>
            </div>

            <div className="bg-bg-base/70 p-3 rounded-xl border border-border-subtle text-xs text-text-muted font-mono line-clamp-3">
              {item.promptText}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.tags.map((tag, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-bg-overlay text-text-muted">
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleUsePrompt(item.promptText)}
                className="px-3 py-1.5 rounded-lg bg-accent-primary/15 hover:bg-accent-primary text-accent-primary hover:text-white font-medium text-xs flex items-center gap-1.5 transition-all"
              >
                Use Prompt <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Prompt Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleAddPrompt}
            className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-border-default space-y-4 shadow-2xl bg-bg-surface"
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-bold text-text-primary text-lg">Create Custom Prompt</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded hover:bg-bg-overlay text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Next.js App Router Refactoring"
                className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
              >
                <option value="coding">Coding</option>
                <option value="writing">Writing</option>
                <option value="agents">AI Agents</option>
                <option value="marketing">Marketing</option>
                <option value="analysis">Analysis</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Prompt Instructions</label>
              <textarea
                required
                rows={4}
                value={newPromptText}
                onChange={(e) => setNewPromptText(e.target.value)}
                placeholder="Enter exact system prompt or instructions..."
                className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary resize-none font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-bg-overlay text-text-secondary hover:text-text-primary text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-accent-primary text-white hover:bg-accent-primary/90 text-sm font-medium shadow-md"
              >
                Save Prompt
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
