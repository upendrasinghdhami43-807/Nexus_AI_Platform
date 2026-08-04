'use client'

import React, { useState, useEffect } from 'react'
import { ModelSelector } from '@/components/chat/ModelSelector'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Share2, Ghost, Copy, Check, X, Link2, Twitter, Mail, Menu, SquarePen, Sparkles } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useChatStore } from '@/stores/chatStore'
import { useRouter } from 'next/navigation'

interface NavbarProps {
  title?: string
}

export function Navbar({ title = 'New Conversation' }: NavbarProps) {
  const { isTemporaryChat, toggleTemporaryChat, toggleMobileSidebar } = useUIStore()
  const { createChat } = useChatStore()
  const router = useRouter()

  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [includeUsername, setIncludeUsername] = useState(false)
  const [shareableUrl, setShareableUrl] = useState('https://nexus-ai.platform/share/chat-992182')

  useEffect(() => {
    if (isShareModalOpen) {
      setShareableUrl(`https://nexus-ai.platform/share/chat-${Math.random().toString(36).substring(2, 9)}`)
    }
  }, [isShareModalOpen])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleNewChat = () => {
    const newId = createChat()
    router.push(`/chat?id=${newId}`)
  }

  return (
    <>
      <header className="h-14 border-b border-border-subtle bg-bg-surface/90 backdrop-blur-md flex items-center justify-between px-3 md:px-5 sticky top-0 z-20 select-none">
        {/* Left Side: Mobile Menu Hamburger & Model Selector */}
        <div className="flex items-center gap-2">
          {/* Mobile Drawer Hamburger Button */}
          <button
            onClick={toggleMobileSidebar}
            aria-label="Open Navigation Drawer"
            className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Model Selector Dropdown (ChatGPT style) */}
          <ModelSelector />

          {isTemporaryChat && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-semibold border border-purple-500/30">
              <Ghost className="w-3 h-3 text-purple-400 animate-pulse" /> Temporary Chat
            </span>
          )}
        </div>

        {/* Right Side Actions: Upgrade Pill, New Chat, Share, Theme Toggle */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Upgrade Pill Button (ChatGPT Screenshot 1 & 2 Style) */}
          <button
            onClick={() => router.push('/settings')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 text-xs font-semibold border border-blue-500/30 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
            <span>Upgrade</span>
          </button>

          {/* New Chat Icon Button (Mobile visible) */}
          <button
            onClick={handleNewChat}
            aria-label="New Chat"
            title="Start new conversation"
            className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-overlay transition-colors"
          >
            <SquarePen className="w-5 h-5" />
          </button>

          {/* Temporary Chat Toggle */}
          <button
            onClick={toggleTemporaryChat}
            aria-label="Toggle Temporary Chat Mode"
            title={isTemporaryChat ? 'Disable Temporary Chat' : 'Enable Temporary Chat'}
            className={`hidden md:flex p-2 rounded-xl text-xs font-medium items-center gap-1.5 transition-all border ${
              isTemporaryChat
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-overlay border-border-subtle'
            }`}
          >
            <Ghost className={`w-4 h-4 ${isTemporaryChat ? 'text-purple-400' : ''}`} />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Share Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            aria-label="Share Conversation"
            className="hidden sm:flex px-3 py-1.5 rounded-xl bg-bg-elevated hover:bg-bg-overlay text-text-primary transition-all border border-border-subtle items-center gap-1.5 text-xs font-medium"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* Share Chat Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-border-default space-y-5 shadow-2xl bg-bg-surface">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2 text-text-primary font-bold text-base">
                <Share2 className="w-5 h-5 text-accent-primary" />
                <span>Share Public Chat Link</span>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-bg-overlay text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Anyone with this link will be able to view a snapshot of this conversation and continue chatting with Nexus AI.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-bg-base border border-border-subtle text-xs">
                <span className="text-text-primary font-medium">Include user handle in link</span>
                <input
                  type="checkbox"
                  checked={includeUsername}
                  onChange={(e) => setIncludeUsername(e.target.checked)}
                  className="w-4 h-4 accent-accent-primary rounded cursor-pointer"
                />
              </div>

              <div className="relative flex items-center">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="w-full bg-bg-base border border-border-default rounded-2xl pl-3 pr-24 py-2.5 text-xs text-text-primary font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="absolute right-1.5 px-3 py-1.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-medium text-xs flex items-center gap-1 shadow-md transition-all"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="pt-2 border-t border-border-subtle flex items-center justify-around text-text-muted">
              <button
                onClick={() => handleCopyLink()}
                className="flex flex-col items-center gap-1 text-[10px] hover:text-accent-primary transition-colors"
              >
                <div className="p-2.5 rounded-2xl bg-bg-base border border-border-subtle hover:border-accent-primary/40">
                  <Link2 className="w-4 h-4" />
                </div>
                <span>Copy Link</span>
              </button>

              <a
                href={`https://twitter.com/intent/tweet?text=Check%20out%20this%20AI%20chat%20conversation%20on%20Nexus%20AI&url=${encodeURIComponent(shareableUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1 text-[10px] hover:text-accent-secondary transition-colors"
              >
                <div className="p-2.5 rounded-2xl bg-bg-base border border-border-subtle hover:border-accent-secondary/40">
                  <Twitter className="w-4 h-4" />
                </div>
                <span>Post on X</span>
              </a>

              <a
                href={`mailto:?subject=Nexus%20AI%20Conversation&body=Here%20is%20a%20link%20to%20the%20chat:%20${encodeURIComponent(shareableUrl)}`}
                className="flex flex-col items-center gap-1 text-[10px] hover:text-emerald-400 transition-colors"
              >
                <div className="p-2.5 rounded-2xl bg-bg-base border border-border-subtle hover:border-emerald-400/40">
                  <Mail className="w-4 h-4" />
                </div>
                <span>Email Link</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
