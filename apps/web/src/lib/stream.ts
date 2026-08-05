const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
const STREAM_URL = `${API_BASE}/chat/stream`

export interface StreamOptions {
  payload: Record<string, unknown>
  onChunk: (delta: string, conversationId?: string) => void
  onDone?: (conversationId?: string) => void
  onError?: (err: Error) => void
  signal?: AbortSignal
}

/**
 * Opens an SSE stream to the Nexus AI backend chat endpoint.
 * Handles conversation_id extraction from the first event,
 * error events, [DONE] termination, and AbortController cancellation.
 */
export async function readSSEStream({
  payload,
  onChunk,
  onDone,
  onError,
  signal,
}: StreamOptions): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  let conversationId: string | undefined

  try {
    const response = await fetch(STREAM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal,
    })

    if (!response.ok) {
      let message = `HTTP ${response.status}`
      try {
        const body = await response.json()
        message = body?.error?.message || body?.detail || message
      } catch {
        // ignore JSON parse failure
      }
      throw new Error(message)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No readable stream available from server.')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()

        // ── Error event ─────────────────────────────────────────────────────
        if (trimmed === 'event: error') continue

        if (!trimmed.startsWith('data: ')) continue

        const dataStr = trimmed.slice(6)

        if (dataStr === '[DONE]') {
          onDone?.(conversationId)
          return
        }

        try {
          const data = JSON.parse(dataStr) as Record<string, unknown>

          // ── First chunk: conversation_id sync ────────────────────────────
          if (data.event === 'conversation_created' && typeof data.conversation_id === 'string') {
            conversationId = data.conversation_id
            // Notify caller with empty delta but conversation_id set
            onChunk('', conversationId)
            continue
          }

          // ── Error payload ────────────────────────────────────────────────
          if (data.code && data.message) {
            throw new Error(String(data.message))
          }

          // ── Normal delta chunk ───────────────────────────────────────────
          if (typeof data.delta === 'string' && data.delta) {
            if (typeof data.conversation_id === 'string') {
              conversationId = data.conversation_id
            }
            onChunk(data.delta, conversationId)
          }
        } catch (parseError) {
          if (parseError instanceof Error && parseError.message !== 'Unexpected token') {
            throw parseError
          }
          // Ignore partial JSON chunks
        }
      }
    }

    onDone?.(conversationId)
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      // Stream was intentionally cancelled — not an error
      onDone?.(conversationId)
      return
    }
    onError?.(err instanceof Error ? err : new Error(String(err)))
  }
}
