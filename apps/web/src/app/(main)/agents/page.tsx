'use client'

import React from 'react'
import { Bot, Sparkles, Terminal, Search, BarChart3 } from 'lucide-react'

export default function AgentsPage() {
  const agents = [
    { name: 'Research Agent', desc: 'Searches the web and synthesizes comprehensive research reports.', icon: Search, model: 'gemini-3.5-flash-thinking' },
    { name: 'Coding Agent', desc: 'Writes, debugs, and tests code snippets in a python sandbox.', icon: Terminal, model: 'gemini-3.5-flash-thinking' },
    { name: 'Data Analyst Agent', desc: 'Parses CSV/Excel files and generates visual data statistics.', icon: BarChart3, model: 'gemini-3.5-flash' },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-border-subtle pb-4">
        <h1 className="text-2xl font-bold text-text-primary">Autonomous AI Agents</h1>
        <p className="text-xs text-text-secondary">Specialized personas equipped with tool calling and web capabilities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent, i) => {
          const Icon = agent.icon
          return (
            <div key={i} className="glass-panel p-5 space-y-4 hover:border-accent-primary/40 transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent-secondary/15 text-accent-secondary flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-text-primary">{agent.name}</h3>
                <p className="text-xs text-text-muted mt-1">{agent.desc}</p>
              </div>
              <div className="text-[10px] text-accent-primary font-mono bg-accent-primary/10 px-2 py-1 rounded w-fit">
                {agent.model}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
