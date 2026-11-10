import React from 'react'
import { StoreProvider } from '@/context/StoreContext'
import { CartProvider } from '@/context/CartContext'
import AppShell from '@/components/layout/AppShell'
import CheckoutView from '@/components/checkout/CheckoutView'

export default function CheckoutPage() {
  return (
    <StoreProvider>
      <CartProvider>
        <AppShell>
          <CheckoutView />
        </AppShell>
      </CartProvider>
    </StoreProvider>
  )
}
