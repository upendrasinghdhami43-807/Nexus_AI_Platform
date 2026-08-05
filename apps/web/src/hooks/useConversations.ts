'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useChatStore, ChatSession } from '@/stores/chatStore'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface BackendConversation {
  id: string
  title: string
  model: string
  is_pinned: boolean
  is_archived: boolean
  updated_at: string
}

function mapConversation(c: BackendConversation): ChatSession {
  return {
    id: c.id,
    title: c.title,
    model: c.model,
    isPinned: c.is_pinned,
    isArchived: c.is_archived,
    updatedAt: new Date(c.updated_at).toLocaleDateString(),
    messagesCount: 0,
  }
}

/**
 * Loads conversations from the backend and syncs them into the chat store.
 * Call this once in the main layout after auth is confirmed.
 */
export function useConversations() {
  const { setChats, setHydrated, deleteChat, renameChat } = useChatStore()
  const hasFetched = useRef(false)

  const fetchConversations = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (!token) return

    try {
      const res = await fetch(`${API_BASE}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = (await res.json()) as BackendConversation[]
      setChats(data.map(mapConversation))
    } catch {
      // Network error — keep whatever is in store
    } finally {
      setHydrated()
    }
  }, [setChats, setHydrated])

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    fetchConversations()
  }, [fetchConversations])

  const deleteConversation = useCallback(async (id: string) => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    // Optimistic delete
    deleteChat(id)
    try {
      await fetch(`${API_BASE}/chat/conversations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      // Rollback not implemented; re-fetch to reconcile
      fetchConversations()
    }
  }, [deleteChat, fetchConversations])

  const renameConversation = useCallback(async (id: string, newTitle: string) => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    // Optimistic update
    renameChat(id, newTitle)
    try {
      await fetch(`${API_BASE}/chat/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle }),
      })
    } catch {
      fetchConversations()
    }
  }, [renameChat, fetchConversations])

  return { fetchConversations, deleteConversation, renameConversation }
}
