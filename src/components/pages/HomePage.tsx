import React from 'react'
import { StoreProvider } from '@/context/StoreContext'
import { CartProvider } from '@/context/CartContext'
import AppShell from '@/components/layout/AppShell'
import HomePageView from '@/components/sections/HomePageView'

export default function HomePage() {
  return (
    <StoreProvider>
      <CartProvider>
        <AppShell>
          <HomePageView />
        </AppShell>
      </CartProvider>
    </StoreProvider>
  )
}
