'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SquarePen, 
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
  Search
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useUIStore } from '@/stores/uiStore'
import { useChatStore } from '@/stores/chatStore'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isSidebarOpen, isMobileSidebarOpen, toggleSidebar, closeMobileSidebar } = useUIStore()
  const { chats, activeChatId, setActiveChatId, togglePinChat, renameChat, deleteChat, createChat } = useChatStore()

  const [mounted, setMounted] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto close mobile drawer on route change
  useEffect(() => {
    closeMobileSidebar()
  }, [pathname, closeMobileSidebar])

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pinnedChats = filteredChats.filter((c) => c.isPinned)
  const recentChats = filteredChats.filter((c) => !c.isPinned)

  const handleStartNewChat = () => {
    const newId = createChat()
    router.push(`/chat?id=${newId}`)
    closeMobileSidebar()
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

  if (!mounted) {
    return (
      <aside className="w-[280px] h-screen border-r border-border-subtle bg-bg-surface flex-shrink-0 hidden lg:block" />
    )
  }

  // Sidebar Content JSX shared between Mobile Drawer & Desktop
  const renderSidebarContent = (isExpanded: boolean, isMobile: boolean = false) => (
    <div className="flex flex-col h-full w-full bg-bg-surface select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border-subtle flex-shrink-0 h-14">
        <div 
          onClick={() => {
            router.push('/')
            if (isMobile) closeMobileSidebar()
          }}
          className="flex items-center gap-2 font-semibold text-base text-text-primary cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-full bg-accent-primary/15 flex items-center justify-center text-accent-primary border border-accent-primary/30">
            <Sparkles className="w-4 h-4" />
          </div>
          {(isExpanded || isMobile) && (
            <span className="font-bold tracking-tight text-text-primary text-sm">Nexus AI</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {(isExpanded || isMobile) && (
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-1.5 rounded-lg hover:bg-bg-overlay text-text-muted hover:text-text-primary transition-colors"
              title="Search chats"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {isMobile ? (
            <button
              onClick={closeMobileSidebar}
              aria-label="Close Mobile Menu"
              className="p-1.5 rounded-lg hover:bg-bg-overlay text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              aria-label={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
              className="p-1.5 rounded-lg hover:bg-bg-overlay text-text-muted hover:text-text-primary transition-colors"
            >
              {isExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3 min-h-0">
        {/* New Chat Button (ChatGPT Style) */}
        <button
          onClick={handleStartNewChat}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-bg-elevated hover:bg-bg-overlay text-text-primary font-medium text-xs transition-all border border-border-subtle shadow-xs',
            !isExpanded && !isMobile && 'justify-center px-0'
          )}
        >
          <SquarePen className="w-4 h-4 text-text-primary flex-shrink-0" />
          {(isExpanded || isMobile) && <span className="text-xs font-semibold">New chat</span>}
        </button>

        {/* Expandable Search Input */}
        {isSearchOpen && (isExpanded || isMobile) && (
          <div className="relative flex items-center animate-fadeIn">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-bg-base border border-border-default focus:border-accent-primary rounded-xl pl-8 pr-7 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-text-muted hover:text-text-primary p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <div className="space-y-0.5 border-b border-border-subtle pb-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobile && closeMobileSidebar()}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-bg-overlay text-text-primary font-semibold'
                    : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary'
                )}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-accent-primary' : 'text-text-muted group-hover:text-text-primary')} />
                {(isExpanded || isMobile) && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </div>

        {/* Chat History List (Pinned & Recent) */}
        {(isExpanded || isMobile) && (
          <div className="space-y-4">
            {filteredChats.length === 0 ? (
              <div className="text-center py-4 text-xs text-text-muted">
                No matching chats found.
              </div>
            ) : (
              <>
                {/* Pinned Section */}
                {pinnedChats.length > 0 && (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold text-accent-primary uppercase tracking-wider">
                      <Pin className="w-3 h-3 text-accent-primary fill-accent-primary" />
                      <span>Pinned</span>
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
                            if (isMobile) closeMobileSidebar()
                          }}
                          className={cn(
                            'group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border',
                            isActive
                              ? 'bg-bg-elevated text-text-primary border-border-default font-semibold shadow-xs'
                              : 'text-text-secondary hover:bg-bg-elevated/70 hover:text-text-primary border-transparent'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <MessageSquare className="w-3.5 h-3.5 text-accent-primary flex-shrink-0" />
                            {isEditing ? (
                              <form onSubmit={(e) => handleSaveRename(chat.id, e)} className="flex items-center gap-1 w-full pr-1">
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
                              <span className="truncate text-xs">{chat.title}</span>
                            )}
                          </div>

                          {!isEditing && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-surface/90 px-1 rounded-md">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  togglePinChat(chat.id)
                                }}
                                className="p-1 text-accent-primary hover:text-text-primary transition-colors"
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

                {/* Recents Section */}
                {recentChats.length > 0 && (
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      <span>Recents</span>
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
                            if (isMobile) closeMobileSidebar()
                          }}
                          className={cn(
                            'group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer border',
                            isActive
                              ? 'bg-bg-elevated text-text-primary border-border-default font-semibold shadow-xs'
                              : 'text-text-secondary hover:bg-bg-elevated/70 hover:text-text-primary border-transparent'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="truncate text-xs">{chat.title}</span>
                          </div>

                          {!isEditing && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-surface/90 px-1 rounded-md">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  togglePinChat(chat.id)
                                }}
                                className="p-1 text-text-muted hover:text-accent-primary transition-colors"
                                title="Pin Chat"
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
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* User Profile Footer (ChatGPT Style - Screenshot 2) */}
      <div className="p-3 border-t border-border-subtle flex items-center justify-between flex-shrink-0 bg-bg-surface">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs">
            BD
          </div>
          {(isExpanded || isMobile) && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-text-primary truncate">Bipin singh Dhami</span>
              <span className="text-[10px] text-text-muted">Free</span>
            </div>
          )}
        </div>

        {(isExpanded || isMobile) && (
          <button 
            onClick={() => router.push('/settings')}
            className="px-2.5 py-1 rounded-full border border-border-default hover:bg-bg-overlay text-xs font-semibold text-text-primary transition-all text-[11px]"
          >
            Upgrade
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop Mask */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobileSidebar}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
            />

            {/* Mobile Sliding Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] max-w-[85vw] z-50 lg:hidden shadow-2xl"
            >
              {renderSidebarContent(true, true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (lg screens) */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 64 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="relative hidden lg:flex flex-col h-screen border-r border-border-subtle bg-bg-surface flex-shrink-0 z-30 select-none overflow-hidden"
      >
        {renderSidebarContent(isSidebarOpen, false)}
      </motion.aside>
    </>
  )
}
