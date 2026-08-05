'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface AuthUser {
  id: string
  email: string
  full_name: string | null
  role: string
  is_active: boolean
  is_verified: boolean
  avatar_url: string | null
}

interface UseAuthReturn {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName?: string) => Promise<void>
  logout: () => void
}

// Simple in-memory reactive state (no external deps required)
let _user: AuthUser | null = null
let _token: string | null = null
let _loading = true
const _listeners = new Set<() => void>()

function notify() {
  _listeners.forEach((fn) => fn())
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

async function fetchCurrentUser(token: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return (await res.json()) as AuthUser
  } catch {
    return null
  }
}

// Bootstrap: load user on first import (client-side only)
if (typeof window !== 'undefined') {
  const storedToken = getStoredToken()
  if (storedToken) {
    fetchCurrentUser(storedToken).then((user) => {
      if (user) {
        _user = user
        _token = storedToken
      } else {
        localStorage.removeItem('access_token')
      }
      _loading = false
      notify()
    })
  } else {
    _loading = false
  }
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()

  // Force re-render when global state changes
  const forceUpdate = useCallback(() => {
    // This triggers a re-render via setState in React 18
    notify()
  }, [])

  useEffect(() => {
    _listeners.add(forceUpdate)
    return () => { _listeners.delete(forceUpdate) }
  }, [forceUpdate])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.detail || `Login failed (${res.status})`)
    }
    const { access_token } = (await res.json()) as { access_token: string }
    localStorage.setItem('access_token', access_token)
    _token = access_token
    _user = await fetchCurrentUser(access_token)
    notify()
    router.replace('/chat')
  }, [router])

  const register = useCallback(async (email: string, password: string, fullName?: string) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.detail || `Registration failed (${res.status})`)
    }
    // Auto-login after registration
    await login(email, password)
  }, [login])

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    _user = null
    _token = null
    notify()
    router.replace('/login')
  }, [router])

  return {
    user: _user,
    token: _token,
    isLoading: _loading,
    login,
    register,
    logout,
  }
}
