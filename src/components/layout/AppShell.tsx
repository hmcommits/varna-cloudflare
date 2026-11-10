'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import GlobalPreviewBanner from '@/components/admin/GlobalPreviewBanner'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    return <main className="min-h-screen bg-[#faf8f5] text-[#142319]">{children}</main>
  }

  return (
    <>
      <GlobalPreviewBanner />
      <TopBar />
      <Navbar />
      <main className="overflow-x-clip">{children}</main>
      <Footer />
    </>
  )
}
