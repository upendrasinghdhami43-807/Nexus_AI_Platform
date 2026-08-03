import type { Metadata } from 'next'
import '@/styles/globals.css'
import { ThemeProvider } from '@/components/shared/ThemeProvider'

export const metadata: Metadata = {
  title: 'Nexus AI Platform — Enterprise AI Workspace',
  description: 'Open-source, self-hosted AI workspace powered by free and premium LLMs.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-bg-base text-text-primary antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
