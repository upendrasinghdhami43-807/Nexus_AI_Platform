import { create } from 'zustand'

interface UIState {
  isSidebarOpen: boolean
  selectedModel: string
  isTemporaryChat: boolean
  toggleSidebar: () => void
  setSelectedModel: (model: string) => void
  toggleTemporaryChat: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  selectedModel: 'gemini-3.5-flash',
  isTemporaryChat: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSelectedModel: (model) => set({ selectedModel: model }),
  toggleTemporaryChat: () => set((state) => ({ isTemporaryChat: !state.isTemporaryChat })),
}))
