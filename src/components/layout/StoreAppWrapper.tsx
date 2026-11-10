import React from 'react'
import { StoreProvider } from '@/context/StoreContext'
import { CartProvider } from '@/context/CartContext'
import AppShell from '@/components/layout/AppShell'

export default function StoreAppWrapper({
  children,
  showChrome = true,
}: {
  children: React.ReactNode
  showChrome?: boolean
}) {
  return (
    <StoreProvider>
      <CartProvider>
        {showChrome ? (
          <AppShell>{children}</AppShell>
        ) : (
          <main className="min-h-screen bg-[#faf8f5] text-[#142319]">{children}</main>
        )}
      </CartProvider>
    </StoreProvider>
  )
}
