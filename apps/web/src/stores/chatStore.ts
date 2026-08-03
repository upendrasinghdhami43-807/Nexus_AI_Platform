import { create } from 'zustand'

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
  setActiveChatId: (id: string | null) => void
  togglePinChat: (id: string) => void
  renameChat: (id: string, newTitle: string) => void
  deleteChat: (id: string) => void
  createChat: () => string
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [
    {
      id: 'c1',
      title: 'FastAPI Streaming Architecture',
      isPinned: true,
      updatedAt: '10m ago',
      messagesCount: 14,
    },
    {
      id: 'c2',
      title: 'Next.js 15 Tailwind CSS Setup',
      isPinned: true,
      updatedAt: '1h ago',
      messagesCount: 8,
    },
    {
      id: 'c3',
      title: 'Python PDF RAG Extractor',
      isPinned: false,
      updatedAt: 'Yesterday',
      messagesCount: 22,
    },
    {
      id: 'c4',
      title: 'Gemini Web Proxy Benchmarks',
      isPinned: false,
      updatedAt: '3 days ago',
      messagesCount: 5,
    },
  ],
  activeChatId: 'c1',

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
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== id),
      activeChatId: state.activeChatId === id ? null : state.activeChatId,
    })),

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
    }))
    return newId
  },
}))
