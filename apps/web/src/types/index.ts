export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  role: 'user' | 'admin'
  createdAt: string
}

export interface Conversation {
  id: string
  title: string
  model: string
  isPinned: boolean
  isArchived: boolean
  projectId?: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  model?: string
  toolCalls?: any
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  systemPrompt?: string
  defaultModel?: string
  fileCount: number
  conversationCount: number
  createdAt: string
}

export interface AIModel {
  id: string
  name: string
  provider: 'gemini_proxy' | 'openai' | 'anthropic' | 'groq' | 'ollama'
  cost: 'free' | 'paid'
  maxOutput: number
  supportsTools: boolean
  supportsVision: boolean
}
