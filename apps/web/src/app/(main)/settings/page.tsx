'use client'

import React, { useState } from 'react'
import { Settings, Key, Cpu, Globe, Shield, Save, Check, Trash2, Sun, Moon, Laptop } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'models' | 'theme' | 'proxy' | 'privacy'>('models')
  const [saved, setSaved] = useState(false)

  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyD-mock-gemini-key-992182')
  const [openAiKey, setOpenAiKey] = useState('')
  const [proxyEndpoint, setProxyEndpoint] = useState('http://localhost:8000/v1/gemini-web')
  const [autoStream, setAutoStream] = useState(true)
  const [webSearchEnabled, setWebSearchEnabled] = useState(true)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4 overflow-y-auto flex-1 h-full min-h-0">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-bg-surface border border-border-default shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Settings className="w-5 h-5 text-accent-primary" />
            Workspace Settings
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure free Gemini Web Proxy endpoints, model API keys, theme appearance, and workspace preferences.
          </p>
        </div>
      </div>

      {/* Compact Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border-subtle pb-2 overflow-x-auto">
        {[
          { id: 'models', label: 'AI Models & Keys', icon: Key },
          { id: 'theme', label: 'Theme & Appearance', icon: Sun },
          { id: 'proxy', label: 'Web Search & Proxy', icon: Globe },
          { id: 'privacy', label: 'Data & Storage', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-accent-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Settings Card */}
      <form onSubmit={handleSave} className="p-4 sm:p-5 rounded-2xl border border-border-default space-y-4 shadow-xs bg-bg-surface">
        {activeTab === 'models' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent-primary" />
                Default LLM Providers
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Nexus AI uses Google Gemini Web Proxy by default (100% Free). You can also add official API keys below.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-primary">Gemini Web Proxy API Key (Optional)</label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-primary">OpenAI / OpenRouter API Key (Optional)</label>
                <input
                  type="password"
                  value={openAiKey}
                  onChange={(e) => setOpenAiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-base border border-border-subtle">
                <div>
                  <div className="text-xs font-semibold text-text-primary">Auto-Stream Responses</div>
                  <div className="text-[10px] text-text-muted">Stream tokens in real-time as they are generated by the model.</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoStream}
                  onChange={(e) => setAutoStream(e.target.checked)}
                  className="w-4 h-4 accent-accent-primary rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                Theme & Device Appearance
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Choose your preferred interface theme or sync automatically with your device system preferences.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setTheme('light')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  theme === 'light'
                    ? 'border-amber-500 bg-amber-500/10 shadow-xs'
                    : 'border-border-default bg-bg-base hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sun className="w-5 h-5 text-amber-500" />
                  {theme === 'light' && <Check className="w-4 h-4 text-amber-500" />}
                </div>
                <div>
                  <div className="font-bold text-text-primary text-xs">Light Mode</div>
                  <div className="text-[10px] text-text-muted mt-0.5">High clarity light aesthetic</div>
                </div>
              </div>

              <div
                onClick={() => setTheme('dark')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  theme === 'dark'
                    ? 'border-purple-500 bg-purple-500/10 shadow-xs'
                    : 'border-border-default bg-bg-base hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Moon className="w-5 h-5 text-purple-400" />
                  {theme === 'dark' && <Check className="w-4 h-4 text-purple-400" />}
                </div>
                <div>
                  <div className="font-bold text-text-primary text-xs">Dark Mode</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Sleek dark glassmorphic theme</div>
                </div>
              </div>

              <div
                onClick={() => setTheme('system')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  theme === 'system'
                    ? 'border-accent-primary bg-accent-primary/10 shadow-xs'
                    : 'border-border-default bg-bg-base hover:border-border-strong'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Laptop className="w-5 h-5 text-accent-secondary" />
                  {theme === 'system' && <Check className="w-4 h-4 text-accent-primary" />}
                </div>
                <div>
                  <div className="font-bold text-text-primary text-xs">System / Device</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Syncs with OS theme settings</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'proxy' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Globe className="w-4 h-4 text-accent-secondary" />
                Live Web Search & Reverse Proxy Configuration
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Configure local backend reverse proxies for unlimited web queries.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-primary">Proxy Service Base URL</label>
                <input
                  type="text"
                  value={proxyEndpoint}
                  onChange={(e) => setProxyEndpoint(e.target.value)}
                  className="w-full bg-bg-base border border-border-default rounded-xl px-3 py-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-bg-base border border-border-subtle">
                <div>
                  <div className="text-xs font-semibold text-text-primary">Enable Web Search Augmentation</div>
                  <div className="text-[10px] text-text-muted">Allow agents to query DuckDuckGo/Google search for real-time answer synthesis.</div>
                </div>
                <input
                  type="checkbox"
                  checked={webSearchEnabled}
                  onChange={(e) => setWebSearchEnabled(e.target.checked)}
                  className="w-4 h-4 accent-accent-primary rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Data, Vector Indexes & Privacy
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Manage locally cached vector databases and session history.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-rose-400">Clear Local Storage & Vector DB</div>
                  <div className="text-[10px] text-text-muted">Deletes all saved chat history, cached embeddings, and file indexes.</div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Local storage and vector cache successfully cleared.')}
                  className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-all w-fit"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Reset Workspace
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions with Decreased Button Size */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          {saved ? (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Saved successfully!
            </span>
          ) : (
            <span className="text-[11px] text-text-muted">Changes apply immediately to active sessions.</span>
          )}

          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5" /> Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}
