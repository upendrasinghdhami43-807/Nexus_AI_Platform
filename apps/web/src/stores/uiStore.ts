import { create } from 'zustand'

interface UIState {
  isSidebarOpen: boolean
  isMobileSidebarOpen: boolean
  selectedModel: string
  isTemporaryChat: boolean
  toggleSidebar: () => void
  toggleMobileSidebar: () => void
  closeMobileSidebar: () => void
  setSelectedModel: (model: string) => void
  toggleTemporaryChat: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  isMobileSidebarOpen: false,
  selectedModel: 'gemini-3.5-flash',
  isTemporaryChat: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  toggleTemporaryChat: () => set((state) => ({ isTemporaryChat: !state.isTemporaryChat })),
}))

