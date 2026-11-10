import React from 'react'
import { StoreProvider } from '@/context/StoreContext'
import { CartProvider } from '@/context/CartContext'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export default function AdminPage() {
  return (
    <StoreProvider>
      <CartProvider>
        <main className="min-h-screen bg-[#faf8f5] text-[#142319]">
          <AdminDashboardClient />
        </main>
      </CartProvider>
    </StoreProvider>
  )
}
