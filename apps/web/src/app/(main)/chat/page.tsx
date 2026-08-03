'use client'

import React, { useState } from 'react'
import { ChatInput } from '@/components/chat/ChatInput'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { Sparkles, Code, FileSearch, PenTool, Terminal } from 'lucide-react'

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = (text: string) => {
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setIsLoading(true)

    // Simulate response stream
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I received your prompt: "${text}". I am connected to the free Gemini Proxy endpoint. How else can I assist you today?`,
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
    <div className="flex flex-col h-full justify-between max-w-4xl mx-auto px-4 py-6">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 my-auto">
          <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
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
                  onClick={() => handleSend(item.title + ' — ' + item.desc)}
                  className="p-4 rounded-xl glass-panel text-left hover:border-accent-primary/40 transition-all group"
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
            <MessageBubble key={index} role={msg.role} content={msg.content} />
          ))}
        </div>
      )}

      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  )
}
