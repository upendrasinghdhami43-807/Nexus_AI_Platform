export interface StreamOptions {
  endpoint: string
  payload: Record<string, any>
  onChunk: (delta: string) => void
  onDone?: () => void
  onError?: (err: Error) => void
}

export async function readSSEStream({
  endpoint,
  payload,
  onChunk,
  onDone,
  onError,
}: StreamOptions) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No readable stream available')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6)
          if (dataStr === '[DONE]') {
            if (onDone) onDone()
            return
          }
          try {
            const data = JSON.parse(dataStr)
            if (data.delta) {
              onChunk(data.delta)
            }
          } catch (e) {
            // Ignore parse errors on partial chunks
          }
        }
      }
    }
    if (onDone) onDone()
  } catch (err: any) {
    if (onError) onError(err)
  }
}
