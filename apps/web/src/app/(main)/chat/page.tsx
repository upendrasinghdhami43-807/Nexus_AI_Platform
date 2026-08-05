'use client'

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChatInput, AttachedFile } from '@/components/chat/ChatInput'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { Sparkles, Globe, Image as ImageIcon, Edit3, Ghost, X, AlertCircle } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useChatStore, Message } from '@/stores/chatStore'
import { readSSEStream } from '@/lib/stream'
import { useAuth } from '@/hooks/useAuth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const SUGGESTIONS = [
  { id: '1', title: 'Create an image', icon: ImageIcon, prompt: 'Create an image of a futuristic workspace with sleek dark glass panels' },
  { id: '2', title: 'Write or edit', icon: Edit3, prompt: 'Help me draft an architectural proposal for a React Next.js web application' },
  { id: '3', title: 'Search the web', icon: Globe, prompt: 'What are the latest updates in AI models and web frameworks in 2026?' },
]

function ChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const urlChatId = searchParams.get('id')

  const { user } = useAuth()
  const { isTemporaryChat, selectedModel } = useUIStore()
  const {
    activeChatId,
    setActiveChatId,
    messagesByChatId,
    addMessageToChat,
    appendToLastAssistantMessage,
    updateUserMessage,
    createLocalChat,
    addOrUpdateChat,
  } = useChatStore()

  const [isLoading, setIsLoading] = useState(false)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Sync active chat from URL
  useEffect(() => {
    if (urlChatId && urlChatId !== activeChatId) {
      setActiveChatId(urlChatId)
    }
  }, [urlChatId, activeChatId, setActiveChatId])

  const currentChatId = activeChatId ?? urlChatId ?? null
  const messages: Message[] = currentChatId ? (messagesByChatId[currentChatId] ?? []) : []

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const stopStream = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsLoading(false)
  }, [])

  const handleSend = useCallback(
    async (text: string, attachments: AttachedFile[], webSearch: boolean) => {
      if (!text.trim() && attachments.length === 0) return
      if (isLoading) return

      setStreamError(null)

      // ── Resolve or create chat ─────────────────────────────────────────────
      let chatId = currentChatId
      if (!chatId) {
        chatId = createLocalChat()
        setActiveChatId(chatId)
      }

      // ── Add user message optimistically ───────────────────────────────────
      const userMsg: Message = {
        role: 'user',
        content: text,
        attachments: attachments.length > 0 ? attachments : undefined,
      }
      addMessageToChat(chatId, userMsg)

      // ── Add empty assistant placeholder for streaming ──────────────────────
      addMessageToChat(chatId, { role: 'assistant', content: '', model: selectedModel })

      setIsLoading(true)

      // ── Create AbortController for this stream ─────────────────────────────
      const controller = new AbortController()
      abortRef.current = controller

      let resolvedChatId = chatId
      const isTempId = chatId.startsWith('tmp_')

      await readSSEStream({
        payload: {
          message: text,
          model: selectedModel,
          web_search: webSearch,
          conversation_id: isTempId ? undefined : chatId,
        },
        signal: controller.signal,

        onChunk: (delta, convId) => {
          // ── On first chunk: replace temp ID with real UUID ─────────────────
          if (convId && isTempId && convId !== resolvedChatId) {
            resolvedChatId = convId
            // Update store: rename temp chat id to real id
            const store = useChatStore.getState()
            const tempMessages = store.messagesByChatId[chatId] ?? []
            const tempChat = store.chats.find((c) => c.id === chatId)

            if (tempChat) {
              store.addOrUpdateChat({ ...tempChat, id: convId })
            }
            // Move messages to real id
            store.addMessageToChat(convId, { role: 'assistant', content: '' })
            tempMessages.forEach((m) => {
              if (m.role === 'user') store.addMessageToChat(convId, m)
            })
            store.deleteChat(chatId)
            store.setActiveChatId(convId)

            // Update URL without re-mount
            router.replace(`/chat?id=${convId}`, { scroll: false })
            return
          }

          // ── Append delta to last assistant message ─────────────────────────
          if (delta) {
            appendToLastAssistantMessage(resolvedChatId, delta)
          }
        },

        onDone: () => {
          setIsLoading(false)
          abortRef.current = null
          // Refresh conversation list to show new title
          addOrUpdateChat({
            id: resolvedChatId,
            title: text.length > 57 ? text.slice(0, 57) + '...' : text,
            model: selectedModel,
            isPinned: false,
            isArchived: false,
            updatedAt: 'Just now',
            messagesCount: messages.length + 2,
          })
        },

        onError: (err) => {
          setIsLoading(false)
          abortRef.current = null
          setStreamError(err.message)
          // Remove empty assistant placeholder on error
          const store = useChatStore.getState()
          const msgs = store.messagesByChatId[resolvedChatId] ?? []
          const lastMsg = msgs[msgs.length - 1]
          if (lastMsg?.role === 'assistant' && !lastMsg.content) {
            store.clearMessages(resolvedChatId)
            msgs.slice(0, -1).forEach((m) => store.addMessageToChat(resolvedChatId, m))
          }
        },
      })
    },
    [
      isLoading,
      currentChatId,
      selectedModel,
      createLocalChat,
      setActiveChatId,
      addMessageToChat,
      appendToLastAssistantMessage,
      addOrUpdateChat,
      messages.length,
      router,
    ]
  )

  const handleEditUserMessage = useCallback(
    async (index: number, newContent: string) => {
      if (!currentChatId) return
      updateUserMessage(currentChatId, index, newContent)
      await handleSend(newContent, [], false)
    },
    [currentChatId, updateUserMessage, handleSend]
  )

  const visibleSuggestions = SUGGESTIONS.filter((s) => !dismissedSuggestions.has(s.id))

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto px-2 sm:px-4 py-2 relative min-h-0 overflow-hidden">
      {/* Temporary Chat Notice */}
      {isTemporaryChat && (
        <div className="mb-2 p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center justify-between shadow-xs animate-fadeIn flex-shrink-0">
          <div className="flex items-center gap-2">
            <Ghost className="w-4 h-4 text-purple-400 animate-pulse flex-shrink-0" />
            <span>
              <strong>Temporary Chat Active</strong> — Messages won&apos;t be saved.
            </span>
          </div>
        </div>
      )}

      {/* Stream Error Banner */}
      {streamError && (
        <div className="mb-2 p-2.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between animate-fadeIn flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{streamError}</span>
          </div>
          <button onClick={() => setStreamError(null)} className="p-1 hover:text-white transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2 pr-1 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-end pb-4 space-y-4 max-w-2xl mx-auto w-full">
            <div className="space-y-2 mb-2">
              {visibleSuggestions.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSend(item.prompt, [], item.title === 'Search the web')}
                    className="group flex items-center justify-between px-4 py-3 rounded-2xl bg-bg-surface hover:bg-bg-elevated border border-border-subtle hover:border-border-default cursor-pointer transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-text-secondary group-hover:text-text-primary">
                      <Icon className="w-4 h-4 text-text-muted group-hover:text-text-primary flex-shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDismissedSuggestions((prev) => new Set([...prev, item.id]))
                      }}
                      className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-overlay transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {messages.map((msg, index) => (
              <MessageBubble
                key={`${currentChatId}-${index}`}
                role={msg.role}
                content={msg.content}
                model={msg.model}
                isStreaming={isLoading && index === messages.length - 1 && msg.role === 'assistant'}
                attachments={msg.attachments}
                webSearchSources={msg.webSearchSources}
                userInitials={user ? (user.full_name ?? user.email).slice(0, 2).toUpperCase() : 'ME'}
                onEdit={msg.role === 'user' ? (newContent) => handleEditUserMessage(index, newContent) : undefined}
              />
            ))}

            {/* Thinking indicator — only when loading and last msg is not assistant */}
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-bg-surface border border-border-subtle w-fit text-xs text-text-secondary">
                <Sparkles className="w-4 h-4 text-accent-primary animate-spin" />
                <span>Nexus AI is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 pt-1">
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          onStop={stopStream}
        />
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-full text-xs text-text-muted gap-2">
          <Sparkles className="w-4 h-4 text-accent-primary animate-pulse" />
          Loading conversation...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  )
}
