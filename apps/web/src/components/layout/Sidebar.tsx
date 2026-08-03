'use client'

import React from 'react'
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
  PanelLeftOpen 
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const { isSidebarOpen, toggleSidebar } = useUIStore()

  const navItems = [
    { href: '/chat', label: 'New Chat', icon: MessageSquarePlus },
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
      animate={{ width: isSidebarOpen ? 260 : 68 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen border-r border-border-subtle bg-bg-surface flex-shrink-0 z-30"
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-subtle">
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 font-bold text-lg bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent"
            >
              <Sparkles className="w-5 h-5 text-accent-primary" />
              Nexus AI
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          className="p-1.5 rounded-md hover:bg-bg-overlay text-text-secondary hover:text-text-primary transition-colors"
        >
          {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href === '/chat' && pathname.startsWith('/chat'))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/20'
                  : 'text-text-secondary hover:bg-bg-overlay hover:text-text-primary'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-accent-primary' : 'group-hover:text-text-primary')} />
              {isSidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-border-subtle flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center font-semibold text-sm flex-shrink-0">
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
