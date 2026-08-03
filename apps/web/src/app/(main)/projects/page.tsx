'use client'

import React from 'react'
import { FolderKanban, Plus, FileText, MessageSquare } from 'lucide-react'

export default function ProjectsPage() {
  const projects = [
    { id: '1', name: 'Nexus AI Architecture', desc: 'Enterprise AI Workspace design docs', files: 20, chats: 12 },
    { id: '2', name: 'Python Backend Microservice', desc: 'FastAPI + SQLAlchemy + Celery setup', files: 8, chats: 5 },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Projects & Workspaces</h1>
          <p className="text-xs text-text-secondary">Organize chats, files, and system prompts into dedicated workspaces.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-primary text-white font-medium text-xs shadow-lg hover:bg-accent-primary/90 transition-all">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => (
          <div key={proj.id} className="glass-panel p-5 space-y-4 hover:border-accent-primary/40 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-text-primary">{proj.name}</h3>
                <p className="text-xs text-text-muted">{proj.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-text-secondary pt-2 border-t border-border-subtle">
              <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {proj.files} Files</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {proj.chats} Chats</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
