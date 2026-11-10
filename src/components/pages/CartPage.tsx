import React from 'react'
import { StoreProvider } from '@/context/StoreContext'
import { CartProvider } from '@/context/CartContext'
import AppShell from '@/components/layout/AppShell'
import CartView from '@/components/cart/CartView'

export default function CartPage() {
  return (
    <StoreProvider>
      <CartProvider>
        <AppShell>
          <CartView />
        </AppShell>
      </CartProvider>
    </StoreProvider>
  )
}
