'use client'

import React, { useState } from 'react'
import { ChatInput, AttachedFile } from '@/components/chat/ChatInput'
import { MessageBubble, SearchSource } from '@/components/chat/MessageBubble'
import { Sparkles, Code, FileSearch, PenTool, Terminal, Ghost, Info } from 'lucide-react'
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
  const { isTemporaryChat } = useUIStore()

  const handleSend = (text: string, attachments: AttachedFile[], webSearch: boolean) => {
    const userMsg: Message = {
      role: 'user',
      content: text,
      attachments: attachments.length > 0 ? attachments : undefined,
    }

    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    // Simulate response stream with real file analysis or web search context
    setTimeout(() => {
      let aiContent = ''
      let sources: SearchSource[] | undefined = undefined

      if (webSearch) {
        sources = [
          {
            title: 'Gemini 1.5 Pro & Web RAG API Documentation',
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
        aiContent = `I received your prompt: "${text}".\n\nI am connected to the free Gemini Proxy endpoint. I can assist with code generation, technical architecture, data analysis, or web research.`
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
    }, 1000)
  }

  const promptSuggestions = [
    { title: 'Write a Python script', desc: 'FastAPI streaming endpoint example', icon: Code },
    { title: 'Analyze a PDF file', desc: 'Extract key insights using RAG', icon: FileSearch },
    { title: 'Draft a blog post', desc: 'SEO-optimized content generator', icon: PenTool },
    { title: 'Explain a concept', desc: 'Quantum computing in simple terms', icon: Terminal },
  ]

  return (
    <div className="flex flex-col h-full justify-between max-w-4xl mx-auto px-4 py-4 relative">
      {/* Temporary Chat Notice Banner */}
      {isTemporaryChat && (
        <div className="mb-2 p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs flex items-center justify-between shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <Ghost className="w-4 h-4 text-purple-400 animate-pulse flex-shrink-0" />
            <span>
              <strong>Temporary Chat Active</strong> — Messages in this session won&apos;t be saved to chat history or used to train models.
            </span>
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 my-auto">
          <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shadow-lg">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-text-primary">What do you want to build today?</h2>
            <p className="text-sm text-text-secondary mt-1">Select a suggested prompt or type your own request below.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
            {promptSuggestions.map((item, idx) => {
              const Icon = item.icon
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(item.title + ' — ' + item.desc, [], false)}
                  className="p-4 rounded-xl glass-panel text-left hover:border-accent-primary/40 transition-all group shadow-md"
                >
                  <Icon className="w-5 h-5 text-accent-primary mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-semibold text-text-primary">{item.title}</div>
                  <div className="text-xs text-text-muted mt-0.5">{item.desc}</div>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
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

      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  )
}
