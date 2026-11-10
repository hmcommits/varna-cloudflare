import React from 'react'
import { StoreProvider } from '@/context/StoreContext'
import { CartProvider } from '@/context/CartContext'
import AppShell from '@/components/layout/AppShell'
import ProductsCatalogClient from '@/components/product/ProductsCatalogClient'

export default function ProductsPage() {
  return (
    <StoreProvider>
      <CartProvider>
        <AppShell>
          <ProductsCatalogClient />
        </AppShell>
      </CartProvider>
    </StoreProvider>
  )
}
