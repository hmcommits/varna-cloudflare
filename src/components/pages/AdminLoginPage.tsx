import React from 'react'
import { StoreProvider } from '@/context/StoreContext'
import { CartProvider } from '@/context/CartContext'
import AdminLoginClient from '@/components/admin/AdminLoginClient'

export default function AdminLoginPage() {
  return (
    <StoreProvider>
      <CartProvider>
        <main className="min-h-screen bg-[#faf8f5] text-[#142319]">
          <AdminLoginClient />
        </main>
      </CartProvider>
    </StoreProvider>
  )
}
