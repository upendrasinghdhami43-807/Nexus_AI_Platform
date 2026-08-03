'use client'

import React, { useState } from 'react'
import { Bot, Plus, Code, Globe, FileText, Sparkles, CheckCircle2, Shield, Settings, X } from 'lucide-react'

interface Agent {
  id: string
  name: string
  role: string
  description: string
  model: string
  enabled: boolean
  tools: string[]
  icon: any
}

export default function AgentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newAgentName, setNewAgentName] = useState('')
  const [newAgentRole, setNewAgentRole] = useState('')
  const [newPrompt, setNewPrompt] = useState('')

  const [agents, setAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'Nexus Code Architect',
      role: 'Senior Full-Stack Developer',
      description: 'Generates clean TypeScript/Next.js code, audits dependencies, and refactors components.',
      model: 'Gemini 3.5 Flash',
      enabled: true,
      tools: ['AST Parser', 'Linter', 'Terminal'],
      icon: Code,
    },
    {
      id: '2',
      name: 'Deep Web Researcher',
      role: 'Autonomous Intelligence Agent',
      description: 'Performs multi-step Google queries, synthesizes documentation, and summarizes live sources.',
      model: 'Gemini Web Proxy',
      enabled: true,
      tools: ['DuckDuckGo', 'HTML Extractor', 'Citation RAG'],
      icon: Globe,
    },
    {
      id: '3',
      name: 'Document QA Analyst',
      role: 'PDF Knowledge Retrieval',
      description: 'Searches vector database embeddings to answer complex technical queries over uploaded files.',
      model: 'Gemini 3.5 Flash',
      enabled: true,
      tools: ['Vector Index', 'PDF Reader', 'Semantic Search'],
      icon: FileText,
    },
    {
      id: '4',
      name: 'SEO & Copy Strategist',
      role: 'Marketing Content Engine',
      description: 'Crafts landing page headlines, blog posts, and converting email sequences.',
      model: 'Gemini 3.5 Flash',
      enabled: false,
      tools: ['Keyword Analyzer', 'Readability Index'],
      icon: Sparkles,
    },
  ])

  const toggleAgent = (id: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    )
  }

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAgentName.trim()) return

    const created: Agent = {
      id: Math.random().toString(36).substring(2, 9),
      name: newAgentName.trim(),
      role: newAgentRole.trim() || 'Custom AI Agent',
      description: newPrompt.trim() || 'Custom configured AI agent for specific workflows.',
      model: 'Gemini 3.5 Flash',
      enabled: true,
      tools: ['Custom Tools', 'Web Search'],
      icon: Bot,
    }

    setAgents([created, ...agents])
    setIsModalOpen(false)
    setNewAgentName('')
    setNewAgentRole('')
    setNewPrompt('')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-border-default shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Bot className="w-6 h-6 text-accent-primary" />
            Autonomous AI Agents
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Deploy specialized agents equipped with code parsing, vector retrieval, and web search tools.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-medium text-sm flex items-center gap-2 shadow-lg transition-all self-start md:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          Create Agent
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => {
          const Icon = agent.icon
          return (
            <div
              key={agent.id}
              className={`glass-panel p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-lg bg-bg-surface/70 ${
                agent.enabled ? 'border-accent-primary/40' : 'border-border-default opacity-70'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary">{agent.name}</h3>
                      <p className="text-xs text-text-muted">{agent.role}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleAgent(agent.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      agent.enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-bg-overlay text-text-muted border border-border-subtle'
                    }`}
                  >
                    {agent.enabled ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed">{agent.description}</p>
              </div>

              <div className="space-y-2 pt-3 border-t border-border-subtle">
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  Assigned Tools & Capabilities
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {agent.tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-bg-overlay border border-border-subtle text-[11px] font-medium text-text-primary"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-text-muted">
                <span>Model: <strong className="text-text-primary">{agent.model}</strong></span>
                <span className="flex items-center gap-1 text-accent-primary font-medium cursor-pointer hover:underline">
                  <Settings className="w-3.5 h-3.5" /> Configure Prompt
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Agent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAgent}
            className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-border-default space-y-4 shadow-2xl bg-bg-surface"
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-bold text-text-primary text-lg">Create Custom AI Agent</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded hover:bg-bg-overlay text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Agent Name</label>
              <input
                type="text"
                required
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                placeholder="e.g. Data Analysis Specialist"
                className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Role & Specialty</label>
              <input
                type="text"
                value={newAgentRole}
                onChange={(e) => setNewAgentRole(e.target.value)}
                placeholder="e.g. Financial & Metrics Analyst"
                className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">System Persona & Instructions</label>
              <textarea
                rows={3}
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="Instructions on how this agent should process requests..."
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
                Deploy Agent
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
