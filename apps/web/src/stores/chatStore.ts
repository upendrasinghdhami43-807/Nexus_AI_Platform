import { create } from 'zustand'
import { AttachedFile } from '@/components/chat/ChatInput'
import { SearchSource } from '@/components/chat/MessageBubble'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  attachments?: AttachedFile[]
  webSearchSources?: SearchSource[]
}

export interface ChatSession {
  id: string
  title: string
  isPinned: boolean
  updatedAt: string
  messagesCount: number
}

interface ChatState {
  chats: ChatSession[]
  activeChatId: string | null
  messagesByChatId: Record<string, Message[]>
  setActiveChatId: (id: string | null) => void
  togglePinChat: (id: string) => void
  renameChat: (id: string, newTitle: string) => void
  deleteChat: (id: string) => void
  createChat: () => string
  addMessageToChat: (chatId: string, message: Message) => void
  updateUserMessage: (chatId: string, index: number, newContent: string) => void
  clearMessages: (chatId: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [
    {
      id: 'c1',
      title: 'FastAPI Streaming Architecture',
      isPinned: true,
      updatedAt: '10m ago',
      messagesCount: 2,
    },
    {
      id: 'c2',
      title: 'Next.js 15 Tailwind CSS Setup',
      isPinned: true,
      updatedAt: '1h ago',
      messagesCount: 2,
    },
    {
      id: 'c3',
      title: 'Python PDF RAG Extractor',
      isPinned: false,
      updatedAt: 'Yesterday',
      messagesCount: 1,
    },
    {
      id: 'c4',
      title: 'Gemini Web Proxy Benchmarks',
      isPinned: false,
      updatedAt: '3 days ago',
      messagesCount: 1,
    },
  ],
  activeChatId: null,
  messagesByChatId: {
    c1: [
      { role: 'user', content: 'How do I set up FastAPI streaming with server-sent events (SSE)?' },
      { role: 'assistant', content: 'To implement SSE streaming in FastAPI, use `StreamingResponse` with an async generator:\n\n```python\nfrom fastapi import FastAPI\nfrom fastapi.responses import StreamingResponse\nimport asyncio\n\napp = FastAPI()\n\nasync def event_generator():\n    for i in range(10):\n        yield f"data: Token {i}\\n\\n"\n        await asyncio.sleep(0.2)\n\n@app.get("/stream")\nasync def stream_tokens():\n    return StreamingResponse(event_generator(), media_type="text/event-stream")\n```' },
    ],
    c2: [
      { role: 'user', content: 'What are the best practices for Next.js 15 App Router styling with Tailwind CSS?' },
      { role: 'assistant', content: '1. Use CSS variables in `globals.css` for theme tokens.\n2. Configure `tailwind.config.ts` to reference these variables.\n3. Utilize `next-themes` for seamless light/dark mode toggling without flash.' },
    ],
    c3: [
      { role: 'user', content: 'Build a PDF text extraction pipeline using PyPDF and LangChain.' },
    ],
    c4: [
      { role: 'user', content: 'Benchmark Gemini 3.5 Flash vs GPT-4o latency on streaming web RAG queries.' },
    ],
  },

  setActiveChatId: (id) => set({ activeChatId: id }),

  togglePinChat: (id) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === id ? { ...chat, isPinned: !chat.isPinned } : chat
      ),
    })),

  renameChat: (id, newTitle) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === id ? { ...chat, title: newTitle } : chat
      ),
    })),

  deleteChat: (id) =>
    set((state) => {
      const nextChats = state.chats.filter((chat) => chat.id !== id)
      const nextActiveId = state.activeChatId === id ? (nextChats[0]?.id || null) : state.activeChatId
      return {
        chats: nextChats,
        activeChatId: nextActiveId,
      }
    }),

  createChat: () => {
    const newId = 'c_' + Math.random().toString(36).substring(2, 9)
    const newChat: ChatSession = {
      id: newId,
      title: 'New Conversation',
      isPinned: false,
      updatedAt: 'Just now',
      messagesCount: 0,
    }
    set((state) => ({
      chats: [newChat, ...state.chats],
      activeChatId: newId,
      messagesByChatId: {
        ...state.messagesByChatId,
        [newId]: [],
      },
    }))
    return newId
  },

  addMessageToChat: (chatId, message) =>
    set((state) => {
      const currentMsgs = state.messagesByChatId[chatId] || []
      const updatedMsgs = [...currentMsgs, message]
      
      // Auto update title if first message
      const updatedChats = state.chats.map((chat) => {
        if (chat.id === chatId) {
          const firstTitle = message.role === 'user' && chat.title === 'New Conversation'
            ? (message.content.length > 30 ? message.content.substring(0, 30) + '...' : message.content)
            : chat.title
          return {
            ...chat,
            title: firstTitle,
            messagesCount: updatedMsgs.length,
            updatedAt: 'Just now',
          }
        }
        return chat
      })

      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: updatedMsgs,
        },
        chats: updatedChats,
      }
    }),

  updateUserMessage: (chatId, index, newContent) =>
    set((state) => {
      const currentMsgs = state.messagesByChatId[chatId] || []
      if (index < 0 || index >= currentMsgs.length) return state

      // Keep messages up to index, update user message at index
      const truncated = currentMsgs.slice(0, index)
      const updatedUserMsg: Message = {
        ...currentMsgs[index],
        content: newContent,
      }
      const newMsgs = [...truncated, updatedUserMsg]

      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: newMsgs,
        },
      }
    }),

  clearMessages: (chatId) =>
    set((state) => ({
      messagesByChatId: {
        ...state.messagesByChatId,
        [chatId]: [],
      },
    })),
}))
