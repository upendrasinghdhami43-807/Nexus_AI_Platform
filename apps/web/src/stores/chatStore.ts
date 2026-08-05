import { create } from 'zustand'
import { AttachedFile } from '@/components/chat/ChatInput'
import { SearchSource } from '@/components/chat/MessageBubble'

export interface Message {
  role: 'user' | 'assistant'
  content: string
  attachments?: AttachedFile[]
  webSearchSources?: SearchSource[]
  model?: string
}

export interface ChatSession {
  id: string           // Backend conversation UUID
  title: string
  model: string
  isPinned: boolean
  isArchived: boolean
  updatedAt: string
  messagesCount: number
}

interface ChatState {
  chats: ChatSession[]
  activeChatId: string | null
  messagesByChatId: Record<string, Message[]>
  isHydrated: boolean

  // Actions
  setChats: (chats: ChatSession[]) => void
  setActiveChatId: (id: string | null) => void
  addOrUpdateChat: (chat: ChatSession) => void
  togglePinChat: (id: string) => void
  renameChat: (id: string, newTitle: string) => void
  deleteChat: (id: string) => void
  createLocalChat: () => string
  addMessageToChat: (chatId: string, message: Message) => void
  appendToLastAssistantMessage: (chatId: string, delta: string) => void
  updateUserMessage: (chatId: string, index: number, newContent: string) => void
  clearMessages: (chatId: string) => void
  setHydrated: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  // ── Initial State (empty — populated from API) ───────────────────────────
  chats: [],
  activeChatId: null,
  messagesByChatId: {},
  isHydrated: false,

  setHydrated: () => set({ isHydrated: true }),

  setChats: (chats) => set({ chats }),

  setActiveChatId: (id) => set({ activeChatId: id }),

  addOrUpdateChat: (chat) =>
    set((state) => {
      const exists = state.chats.some((c) => c.id === chat.id)
      if (exists) {
        return { chats: state.chats.map((c) => (c.id === chat.id ? { ...c, ...chat } : c)) }
      }
      return { chats: [chat, ...state.chats] }
    }),

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
      const nextMessages = { ...state.messagesByChatId }
      delete nextMessages[id]
      const nextActiveId =
        state.activeChatId === id ? (nextChats[0]?.id ?? null) : state.activeChatId
      return {
        chats: nextChats,
        messagesByChatId: nextMessages,
        activeChatId: nextActiveId,
      }
    }),

  createLocalChat: () => {
    // Creates a temporary local chat before the backend assigns a real UUID.
    // The id will be replaced once the first SSE chunk arrives.
    const tempId = 'tmp_' + Math.random().toString(36).slice(2, 9)
    const newChat: ChatSession = {
      id: tempId,
      title: 'New Conversation',
      model: 'gemini-3.5-flash',
      isPinned: false,
      isArchived: false,
      updatedAt: 'Just now',
      messagesCount: 0,
    }
    set((state) => ({
      chats: [newChat, ...state.chats],
      activeChatId: tempId,
      messagesByChatId: { ...state.messagesByChatId, [tempId]: [] },
    }))
    return tempId
  },

  addMessageToChat: (chatId, message) =>
    set((state) => {
      const current = state.messagesByChatId[chatId] ?? []
      const updated = [...current, message]
      const updatedChats = state.chats.map((chat) => {
        if (chat.id !== chatId) return chat
        const autoTitle =
          message.role === 'user' && chat.title === 'New Conversation'
            ? message.content.length > 57
              ? message.content.slice(0, 57) + '...'
              : message.content
            : chat.title
        return {
          ...chat,
          title: autoTitle,
          messagesCount: updated.length,
          updatedAt: 'Just now',
        }
      })
      return {
        messagesByChatId: { ...state.messagesByChatId, [chatId]: updated },
        chats: updatedChats,
      }
    }),

  appendToLastAssistantMessage: (chatId, delta) =>
    set((state) => {
      const current = state.messagesByChatId[chatId] ?? []
      if (current.length === 0) return state
      const last = current[current.length - 1]
      if (last.role !== 'assistant') return state
      const updated = [
        ...current.slice(0, -1),
        { ...last, content: last.content + delta },
      ]
      return { messagesByChatId: { ...state.messagesByChatId, [chatId]: updated } }
    }),

  updateUserMessage: (chatId, index, newContent) =>
    set((state) => {
      const current = state.messagesByChatId[chatId] ?? []
      if (index < 0 || index >= current.length) return state
      const truncated = current.slice(0, index)
      const updatedMsg: Message = { ...current[index], content: newContent }
      return {
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: [...truncated, updatedMsg],
        },
      }
    }),

  clearMessages: (chatId) =>
    set((state) => ({
      messagesByChatId: { ...state.messagesByChatId, [chatId]: [] },
    })),
}))
