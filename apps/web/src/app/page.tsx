import Link from 'next/link'
import { Sparkles, Zap, Shield, Bot, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col justify-between p-6">
      <header className="flex justify-between items-center max-w-6xl mx-auto w-full py-4">
        <div className="flex items-center gap-2 font-bold text-xl bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
          <Sparkles className="w-6 h-6 text-accent-primary" />
          Nexus AI
        </div>
        <Link
          href="/chat"
          className="px-4 py-2 rounded-xl bg-accent-primary hover:bg-accent-primary/90 text-white font-medium text-sm transition-all shadow-lg"
        >
          Launch Workspace
        </Link>
      </header>

      <main className="max-w-4xl mx-auto text-center space-y-8 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-accent-primary text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" /> 100% Free Tier Powered by Gemini Web Proxy
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          One Workspace to Think, Code, and Create.
        </h1>

        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          An open-source AI platform combining ChatGPT, Claude, and Perplexity capabilities without mandatory API fees.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            href="/chat"
            className="px-6 py-3 rounded-xl bg-accent-primary text-white font-semibold flex items-center gap-2 shadow-xl hover:bg-accent-primary/90 transition-all"
          >
            Start Chatting <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <footer className="text-center text-xs text-text-muted py-6 border-t border-border-subtle">
        © 2026 Nexus AI Platform — MIT Licensed.
      </footer>
    </div>
  )
}
