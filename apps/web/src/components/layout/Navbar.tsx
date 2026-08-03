'use client'

import React, { useState, useEffect } from 'react'
import { ModelSelector } from '@/components/chat/ModelSelector'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Share2, Ghost, Copy, Check, X, Link2, Twitter, Mail } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

interface NavbarProps {
  title?: string
}

export function Navbar({ title = 'New Conversation' }: NavbarProps) {
  const { isTemporaryChat, toggleTemporaryChat } = useUIStore()
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

  return (
    <>
      <header className="h-14 border-b border-border-subtle bg-bg-base/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-sm text-text-primary truncate max-w-xs md:max-w-md flex items-center gap-2">
            {title}
            {isTemporaryChat && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-semibold border border-purple-500/30">
                <Ghost className="w-3 h-3 text-purple-400 animate-pulse" /> Temporary Chat
              </span>
            )}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Temporary Chat Toggle */}
          <button
            onClick={toggleTemporaryChat}
            aria-label="Toggle Temporary Chat Mode"
            title={isTemporaryChat ? 'Disable Temporary Chat' : 'Enable Temporary Chat (Incognito Mode)'}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              isTemporaryChat
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-overlay border-border-subtle'
            }`}
          >
            <Ghost className={`w-3.5 h-3.5 ${isTemporaryChat ? 'text-purple-400' : ''}`} />
            <span className="hidden sm:inline">Temporary</span>
          </button>

          {/* Model Selector */}
          <ModelSelector />

          {/* Light / Dark / Device Theme Selector */}
          <ThemeToggle />

          {/* Share Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            aria-label="Share Conversation"
            className="px-3 py-1.5 rounded-lg bg-accent-primary/15 hover:bg-accent-primary text-accent-primary hover:text-white transition-all border border-accent-primary/30 flex items-center gap-1.5 text-xs font-medium shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </header>

      {/* Share Chat Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-border-default space-y-5 shadow-2xl bg-bg-surface">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2 text-text-primary font-bold text-base">
                <Share2 className="w-5 h-5 text-accent-primary" />
                <span>Share Public Chat Link</span>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1 rounded-lg hover:bg-bg-overlay text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Anyone with this link will be able to view a snapshot of this conversation and continue chatting with Nexus AI.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-base border border-border-subtle text-xs">
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
                  className="w-full bg-bg-base border border-border-default rounded-xl pl-3 pr-24 py-2.5 text-xs text-text-primary font-mono select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-white font-medium text-xs flex items-center gap-1 shadow-md transition-all"
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
                <div className="p-2.5 rounded-xl bg-bg-base border border-border-subtle hover:border-accent-primary/40">
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
                <div className="p-2.5 rounded-xl bg-bg-base border border-border-subtle hover:border-accent-secondary/40">
                  <Twitter className="w-4 h-4" />
                </div>
                <span>Post on X</span>
              </a>

              <a
                href={`mailto:?subject=Nexus%20AI%20Conversation&body=Here%20is%20a%20link%20to%20the%20chat:%20${encodeURIComponent(shareableUrl)}`}
                className="flex flex-col items-center gap-1 text-[10px] hover:text-emerald-400 transition-colors"
              >
                <div className="p-2.5 rounded-xl bg-bg-base border border-border-subtle hover:border-emerald-400/40">
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
