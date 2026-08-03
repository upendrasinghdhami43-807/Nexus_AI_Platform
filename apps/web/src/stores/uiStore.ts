import { create } from 'zustand'

interface UIState {
  isSidebarOpen: boolean
  selectedModel: string
  toggleSidebar: () => void
  setSelectedModel: (model: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  selectedModel: 'gemini-3.5-flash',
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSelectedModel: (model) => set({ selectedModel: model }),
}))
