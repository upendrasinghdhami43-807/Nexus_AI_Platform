'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquarePlus, 
  FolderKanban, 
  Bot, 
  Globe, 
  FileText, 
  Sparkles, 
  Settings, 
  PanelLeftClose, 
  PanelLeftOpen,
  Pin,
  PinOff,
  Edit2,
  Trash2,
  MessageSquare,
  Check,
  X,
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUIStore } from '@/stores/uiStore'
import { useChatStore } from '@/stores/chatStore'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isSidebarOpen, toggleSidebar } = useUIStore()
  const { chats, activeChatId, setActiveChatId, togglePinChat, renameChat, deleteChat, createChat } = useChatStore()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const pinnedChats = chats.filter((c) => c.isPinned)
  const recentChats = chats.filter((c) => !c.isPinned)

  const handleStartNewChat = () => {
    const newId = createChat()
    router.push(`/chat?id=${newId}`)
  }

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingId(id)
    setEditingTitle(currentTitle)
  }

  const handleSaveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (editingTitle.trim()) {
      renameChat(id, editingTitle.trim())
    }
    setEditingId(null)
  }

  const navItems = [
    { href: '/projects', label: 'Projects', icon: FolderKanban },
    { href: '/agents', label: 'Agents', icon: Bot },
    { href: '/search', label: 'Web Search', icon: Globe },
    { href: '/files', label: 'Files', icon: FileText },
    { href: '/prompts', label: 'Prompt Library', icon: Sparkles },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 280 : 68 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen border-r border-border-subtle bg-bg-surface flex-shrink-0 z-30 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-subtle">
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 font-extrabold text-lg bg-gradient-to-r from-accent-primary via-purple-400 to-accent-secondary bg-clip-text text-transparent cursor-pointer"
              onClick={() => router.push('/')}
            >
              <Sparkles className="w-5 h-5 text-accent-primary" />
              Nexus AI
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          className="p-1.5 rounded-lg hover:bg-bg-overlay text-text-secondary hover:text-text-primary transition-colors"
        >
          {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={handleStartNewChat}
          className={cn(
            'w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-accent-primary/20',
            !isSidebarOpen && 'px-0 justify-center'
          )}
        >
          <MessageSquarePlus className="w-4.5 h-4.5 flex-shrink-0" />
          {isSidebarOpen && <span>New Chat</span>}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="px-2 py-1 space-y-0.5 border-b border-border-subtle pb-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                isActive
                  ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/20'
                  : 'text-text-secondary hover:bg-bg-overlay hover:text-text-primary'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-accent-primary' : 'group-hover:text-text-primary')} />
              {isSidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </div>

      {/* Chat History List (Pinned & Recent) */}
      {isSidebarOpen && (
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {/* Pinned Section */}
          {pinnedChats.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 px-3 text-[10px] font-bold text-accent-primary uppercase tracking-wider">
                <Pin className="w-3 h-3 text-accent-primary fill-accent-primary" />
                <span>Pinned Chats</span>
              </div>

              {pinnedChats.map((chat) => {
                const isActive = activeChatId === chat.id
                const isEditing = editingId === chat.id

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveChatId(chat.id)
                      router.push('/chat')
                    }}
                    className={cn(
                      'group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border',
                      isActive
                        ? 'bg-bg-overlay text-text-primary border-accent-primary/30 shadow-sm font-semibold'
                        : 'text-text-secondary hover:bg-bg-overlay/60 hover:text-text-primary border-transparent'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare className="w-3.5 h-3.5 text-accent-primary flex-shrink-0" />
                      {isEditing ? (
                        <form onSubmit={(e) => handleSaveRename(chat.id, e)} className="flex items-center gap-1 w-full pr-2">
                          <input
                            type="text"
                            autoFocus
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="bg-bg-base border border-accent-primary rounded px-1.5 py-0.5 text-xs text-text-primary w-full focus:outline-none"
                          />
                          <button type="submit" className="text-emerald-400 p-0.5 hover:bg-bg-elevated rounded">
                            <Check className="w-3 h-3" />
                          </button>
                          <button type="button" onClick={() => setEditingId(null)} className="text-text-muted p-0.5 hover:bg-bg-elevated rounded">
                            <X className="w-3 h-3" />
                          </button>
                        </form>
                      ) : (
                        <span className="truncate">{chat.title}</span>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-surface/90 px-1 rounded-md">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            togglePinChat(chat.id)
                          }}
                          className="p-1 text-accent-primary hover:text-white transition-colors"
                          title="Unpin Chat"
                        >
                          <PinOff className="w-3 h-3" />
                        </button>

                        <button
                          onClick={(e) => handleStartRename(chat.id, chat.title, e)}
                          className="p-1 text-text-muted hover:text-text-primary transition-colors"
                          title="Rename Chat"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteChat(chat.id)
                          }}
                          className="p-1 text-text-muted hover:text-rose-400 transition-colors"
                          title="Delete Chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Recent Section */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 px-3 text-[10px] font-bold text-text-muted uppercase tracking-wider">
              <span>Recent Chats</span>
            </div>

            {recentChats.map((chat) => {
              const isActive = activeChatId === chat.id
              const isEditing = editingId === chat.id

              return (
                <div
                  key={chat.id}
                  onClick={() => {
                    setActiveChatId(chat.id)
                    router.push('/chat')
                  }}
                  className={cn(
                    'group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border',
                    isActive
                      ? 'bg-bg-overlay text-text-primary border-border-default shadow-sm font-semibold'
                      : 'text-text-secondary hover:bg-bg-overlay/60 hover:text-text-primary border-transparent'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className="w-3.5 h-3.5 text-text-muted flex-shrink-0 group-hover:text-text-primary" />
                    {isEditing ? (
                      <form onSubmit={(e) => handleSaveRename(chat.id, e)} className="flex items-center gap-1 w-full pr-2">
                        <input
                          type="text"
                          autoFocus
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="bg-bg-base border border-accent-primary rounded px-1.5 py-0.5 text-xs text-text-primary w-full focus:outline-none"
                        />
                        <button type="submit" className="text-emerald-400 p-0.5 hover:bg-bg-elevated rounded">
                          <Check className="w-3 h-3" />
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="text-text-muted p-0.5 hover:bg-bg-elevated rounded">
                          <X className="w-3 h-3" />
                        </button>
                      </form>
                    ) : (
                      <span className="truncate">{chat.title}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-surface/90 px-1 rounded-md">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          togglePinChat(chat.id)
                        }}
                        className="p-1 text-text-muted hover:text-accent-primary transition-colors"
                        title="Pin Chat to top"
                      >
                        <Pin className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => handleStartRename(chat.id, chat.title, e)}
                        className="p-1 text-text-muted hover:text-text-primary transition-colors"
                        title="Rename Chat"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteChat(chat.id)
                        }}
                        className="p-1 text-text-muted hover:text-rose-400 transition-colors"
                        title="Delete Chat"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* User Profile Footer */}
      <div className="p-3 border-t border-border-subtle flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-accent-primary/20 text-accent-primary flex items-center justify-center font-bold text-xs flex-shrink-0 border border-accent-primary/30">
          NX
        </div>
        {isSidebarOpen && (
          <div className="flex flex-col truncate">
            <span className="text-xs font-semibold text-text-primary">Developer</span>
            <span className="text-[10px] text-text-muted">Pro Workspace</span>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
