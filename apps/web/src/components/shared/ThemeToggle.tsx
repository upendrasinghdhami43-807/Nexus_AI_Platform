'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Laptop, ChevronDown } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-bg-surface border border-border-subtle" />
    )
  }

  const getCurrentIcon = () => {
    if (theme === 'dark') return <Moon className="w-4 h-4 text-purple-400" />
    if (theme === 'light') return <Sun className="w-4 h-4 text-amber-500" />
    return <Laptop className="w-4 h-4 text-accent-secondary" />
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Theme Mode"
        title={`Current Theme: ${theme || 'system'}`}
        className="flex items-center gap-1.5 p-2 rounded-lg bg-bg-surface border border-border-subtle hover:border-border-default text-text-secondary hover:text-text-primary transition-all text-xs font-medium shadow-sm"
      >
        {getCurrentIcon()}
        <span className="capitalize hidden md:inline text-xs font-medium">
          {theme === 'system' ? 'Device' : theme}
        </span>
        <ChevronDown className="w-3 h-3 text-text-muted" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-xl bg-bg-elevated border border-border-default shadow-2xl z-50 p-1 space-y-0.5 animate-fadeIn">
          <button
            onClick={() => {
              setTheme('light')
              setIsOpen(false)
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              theme === 'light'
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                : 'text-text-primary hover:bg-bg-overlay'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Light</span>
          </button>

          <button
            onClick={() => {
              setTheme('dark')
              setIsOpen(false)
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-purple-500/15 text-purple-400 font-bold'
                : 'text-text-primary hover:bg-bg-overlay'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-purple-400" />
            <span>Dark</span>
          </button>

          <button
            onClick={() => {
              setTheme('system')
              setIsOpen(false)
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              theme === 'system'
                ? 'bg-accent-primary/15 text-accent-primary font-bold'
                : 'text-text-primary hover:bg-bg-overlay'
            }`}
          >
            <Laptop className="w-3.5 h-3.5 text-accent-secondary" />
            <span>Device Auto</span>
          </button>
        </div>
      )}
    </div>
  )
}
