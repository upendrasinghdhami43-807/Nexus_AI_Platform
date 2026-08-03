'use client'

import React, { useState } from 'react'
import { FolderKanban, Plus, FileText, Bot, Calendar, ArrowRight, Search, X, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Project {
  id: string
  name: string
  description: string
  filesCount: number
  agentsCount: number
  status: 'active' | 'archived' | 'in-progress'
  updatedAt: string
}

export default function ProjectsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Nexus AI Full-Stack Platform',
      description: 'Next.js 15 enterprise workspace with free Gemini Web Proxy & multi-agent execution pipeline.',
      filesCount: 12,
      agentsCount: 4,
      status: 'active',
      updatedAt: '2 hours ago',
    },
    {
      id: '2',
      name: 'Autonomous RAG Research Suite',
      description: 'PDF knowledge extraction, vector store embedding indexing, and citation search engine.',
      filesCount: 8,
      agentsCount: 2,
      status: 'in-progress',
      updatedAt: '1 day ago',
    },
    {
      id: '3',
      name: 'Python FastAPI Microservices',
      description: 'Streaming backend proxy endpoints, WebSockets synchronization, and OAuth auth provider.',
      filesCount: 15,
      agentsCount: 3,
      status: 'active',
      updatedAt: '3 days ago',
    },
  ])

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const created: Project = {
      id: Math.random().toString(36).substring(2, 9),
      name: newName.trim(),
      description: newDesc.trim() || 'New AI Project Workspace.',
      filesCount: 0,
      agentsCount: 1,
      status: 'active',
      updatedAt: 'Just now',
    }

    setProjects([created, ...projects])
    setIsModalOpen(false)
    setNewName('')
    setNewDesc('')
  }

  const filteredProjects = projects.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-border-default shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-accent-primary" />
            Project Workspaces
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Organize chats, uploaded knowledge files, system prompts, and AI agent workflows by project.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-medium text-sm flex items-center gap-2 shadow-lg transition-all self-start md:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects..."
          className="w-full bg-bg-surface border border-border-default rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 transition-colors"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => router.push('/chat')}
            className="glass-panel p-6 rounded-2xl border border-border-default hover:border-accent-primary/50 transition-all flex flex-col justify-between space-y-4 shadow-lg cursor-pointer group bg-bg-surface/70"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                    project.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {project.status}
                </span>
                <span className="text-[10px] text-text-muted flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {project.updatedAt}
                </span>
              </div>

              <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{project.description}</p>
            </div>

            <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 font-medium text-text-primary">
                  <FileText className="w-3.5 h-3.5 text-accent-secondary" /> {project.filesCount} Files
                </span>
                <span className="flex items-center gap-1 font-medium text-text-primary">
                  <Bot className="w-3.5 h-3.5 text-accent-primary" /> {project.agentsCount} Agents
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-accent-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateProject}
            className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-border-default space-y-4 shadow-2xl bg-bg-surface"
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <h3 className="font-bold text-text-primary text-lg">Create New Project</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded hover:bg-bg-overlay text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Project Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Mobile App AI Assistant"
                className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Description</label>
              <textarea
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe project scope and goals..."
                className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary resize-none"
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
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
