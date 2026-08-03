import React from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto relative">{children}</main>
      </div>
    </div>
  )
}
