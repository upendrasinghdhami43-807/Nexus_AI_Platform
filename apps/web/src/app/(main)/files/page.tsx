'use client'

import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  FileText,
  FileCode,
  Image as ImageIcon,
  Trash2,
  Eye,
  Download,
  Search,
  Filter,
  CheckCircle2,
  HardDrive,
  X,
  Plus
} from 'lucide-react'

interface FileItem {
  id: string
  name: string
  size: string
  type: 'document' | 'code' | 'image' | 'data'
  updatedAt: string
  vectorIndexed: boolean
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([
    { id: '1', name: 'system_architecture.pdf', size: '2.4 MB', type: 'document', updatedAt: '2 hours ago', vectorIndexed: true },
    { id: '2', name: 'api_routes_v2.ts', size: '14.2 KB', type: 'code', updatedAt: '1 day ago', vectorIndexed: true },
    { id: '3', name: 'nexus_dashboard_mockup.png', size: '1.8 MB', type: 'image', updatedAt: '3 days ago', vectorIndexed: false },
    { id: '4', name: 'dataset_training_rag.json', size: '5.6 MB', type: 'data', updatedAt: 'Just now', vectorIndexed: true },
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    setIsUploading(true)

    setTimeout(() => {
      const uploaded = Array.from(e.target.files!).map((file, idx) => ({
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type.includes('image')
          ? ('image' as const)
          : file.type.includes('json') || file.type.includes('csv')
          ? ('data' as const)
          : file.name.includes('.') && ['ts', 'js', 'py', 'css', 'html'].includes(file.name.split('.').pop()!)
          ? ('code' as const)
          : ('document' as const),
        updatedAt: 'Just now',
        vectorIndexed: true,
      }))

      setFiles((prev) => [...uploaded, ...prev])
      setIsUploading(false)
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    }, 800)
  }

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    if (selectedFile?.id === id) setSelectedFile(null)
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === 'all' || file.type === activeFilter
    return matchesSearch && matchesFilter
  })

  const getIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'code':
        return <FileCode className="w-5 h-5 text-accent-primary" />
      case 'image':
        return <ImageIcon className="w-5 h-5 text-accent-secondary" />
      case 'data':
        return <HardDrive className="w-5 h-5 text-purple-400" />
      default:
        return <FileText className="w-5 h-5 text-blue-400" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header & Storage Metric */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-border-default shadow-lg">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-accent-primary" />
            File Knowledge Base
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Upload PDFs, Code, and Data files to index automatically for RAG vector search across all AI agents.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-text-muted">Storage Used</div>
            <div className="text-sm font-semibold text-text-primary">10.0 MB / 10 GB</div>
          </div>

          <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-medium text-sm flex items-center gap-2 shadow-lg transition-all"
          >
            {isUploading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-4.5 h-4.5" />
            )}
            Upload Files
          </button>
        </div>
      </div>

      {/* Upload Banner Alert */}
      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5" />
          <span>Files successfully uploaded and indexed into Nexus RAG vector store!</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full bg-bg-surface border border-border-default rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {['all', 'document', 'code', 'image', 'data'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-accent-primary text-white shadow-md'
                  : 'bg-bg-surface text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* File Table / Grid */}
      <div className="glass-panel rounded-2xl border border-border-default overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-overlay/50 border-b border-border-subtle text-text-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Indexed</th>
                <th className="px-6 py-4">Uploaded</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-text-muted">
                    No files found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-bg-overlay/40 transition-colors group">
                    <td className="px-6 py-4 font-medium text-text-primary flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-bg-surface border border-border-subtle">
                        {getIcon(file.type)}
                      </div>
                      <span className="truncate max-w-xs">{file.name}</span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary capitalize">{file.type}</td>
                    <td className="px-6 py-4 text-text-muted text-xs">{file.size}</td>
                    <td className="px-6 py-4">
                      {file.vectorIndexed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Indexed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-medium border border-amber-500/20">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-muted text-xs">{file.updatedAt}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedFile(file)}
                          className="p-1.5 rounded-lg hover:bg-bg-overlay text-text-muted hover:text-text-primary transition-colors"
                          title="Preview File"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-text-muted hover:text-rose-400 transition-colors"
                          title="Delete File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel w-full max-w-xl p-6 rounded-2xl border border-border-default space-y-6 shadow-2xl bg-bg-surface">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-3">
                {getIcon(selectedFile.type)}
                <div>
                  <h3 className="font-semibold text-text-primary text-base">{selectedFile.name}</h3>
                  <p className="text-xs text-text-muted">{selectedFile.size} • {selectedFile.updatedAt}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1.5 rounded-lg hover:bg-bg-overlay text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-bg-base p-4 rounded-xl border border-border-subtle text-xs text-text-secondary font-mono space-y-2 max-h-60 overflow-y-auto">
              <p className="text-text-muted">// File Metadata & Preview Context</p>
              <p>Indexed Status: {selectedFile.vectorIndexed ? 'RAG Ready (100% Chunked)' : 'Pending Queue'}</p>
              <p>Type: {selectedFile.type}</p>
              <p>Path: /workspace/knowledge_base/{selectedFile.name}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 rounded-xl bg-bg-overlay text-text-secondary hover:text-text-primary text-sm font-medium"
              >
                Close
              </button>
              <button
                onClick={() => alert(`Downloading ${selectedFile.name}...`)}
                className="px-4 py-2 rounded-xl bg-accent-primary text-white hover:bg-accent-primary/90 text-sm font-medium flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
