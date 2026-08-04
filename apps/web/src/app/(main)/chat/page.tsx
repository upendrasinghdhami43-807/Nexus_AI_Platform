'use client'

import React, { useState } from 'react'
import { ChatInput, AttachedFile } from '@/components/chat/ChatInput'
import { MessageBubble, SearchSource } from '@/components/chat/MessageBubble'
import { Sparkles, Code, Globe, Image as ImageIcon, Edit3, X, Ghost } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

interface Message {
  role: 'user' | 'assistant'
  content: string
  attachments?: AttachedFile[]
  webSearchSources?: SearchSource[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([
    { id: '1', title: 'Create an image', icon: ImageIcon, prompt: 'Create an image of a futuristic workspace with modern glass interface' },
    { id: '2', title: 'Write or edit', icon: Edit3, prompt: 'Help me draft an architectural proposal for a React Next.js web application' },
    { id: '3', title: 'Search the web', icon: Globe, prompt: 'What are the latest updates in AI models and web frameworks in 2026?' },
  ])

  const { isTemporaryChat } = useUIStore()

  const handleSend = (text: string, attachments: AttachedFile[], webSearch: boolean) => {
    const userMsg: Message = {
      role: 'user',
      content: text,
      attachments: attachments.length > 0 ? attachments : undefined,
    }

    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    // Simulate response stream
    setTimeout(() => {
      let aiContent = ''
      let sources: SearchSource[] | undefined = undefined

      if (webSearch) {
        sources = [
          {
            title: 'Gemini 3.5 Pro & Web RAG API Documentation',
            url: 'https://ai.google.dev/docs/gemini_web_api',
            snippet: 'Real-time web browsing and information retrieval via Nexus AI platform proxy.',
          },
          {
            title: 'Next.js 15 App Router & Server Components',
            url: 'https://nextjs.org/docs/app',
            snippet: 'Optimized production build with server actions and streaming support.',
          },
        ]
        aiContent = `Here are the latest web search findings for "${text}":\n\n1. **Real-time Web Integration**: Nexus AI retrieved live web sources.\n2. **Synthesis**: Based on recent data, the request was processed with up-to-date documentation and code samples.\n\nLet me know if you would like me to deep dive into any specific result!`
      } else if (attachments.length > 0) {
        const fileNames = attachments.map((f) => f.name).join(', ')
        aiContent = `I have analyzed the uploaded file(s): **${fileNames}**.\n\n- **Extracted Content**: File structural parse complete.\n- **Summary**: Key technical specifications and data definitions have been indexed into the current session context.\n\nHow would you like me to process or transform this data?`
      } else {
        aiContent = `I received your prompt: "${text}".\n\nI am connected to the Nexus AI engine. I can assist with code generation, technical architecture, content drafting, or web research.`
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: aiContent,
          webSearchSources: sources,
        },
      ])
      setIsLoading(false)
    }, 900)
  }

  const dismissSuggestion = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSuggestions((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="flex flex-col h-full justify-between max-w-4xl mx-auto px-3 sm:px-4 py-2 relative">
      {/* Temporary Chat Notice Banner */}
      {isTemporaryChat && (
        <div className="mb-2 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <Ghost className="w-4 h-4 text-purple-400 animate-pulse flex-shrink-0" />
            <span>
              <strong>Temporary Chat Active</strong> — Messages in this session won&apos;t be saved to chat history.
            </span>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col justify-end pb-4 space-y-4 max-w-2xl mx-auto w-full">
          {/* Quick Action Suggestion Rows (ChatGPT Screenshot 1 Style) */}
          <div className="space-y-2 mb-2">
            {suggestions.map((item) => {
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
                    onClick={(e) => dismissSuggestion(item.id, e)}
                    className="p-1 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-overlay transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          {messages.map((msg, index) => (
            <MessageBubble
              key={index}
              role={msg.role}
              content={msg.content}
              attachments={msg.attachments}
              webSearchSources={msg.webSearchSources}
            />
          ))}
        </div>
      )}

      {/* Floating ChatGPT Pill Input Bar */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  )
}
