import React from 'react'
import { StoreProvider } from '@/context/StoreContext'
import { CartProvider } from '@/context/CartContext'
import AppShell from '@/components/layout/AppShell'
import ProductDetailsView from '@/components/product/ProductDetailsView'

export default function ProductDetailPage({ productId }: { productId?: string }) {
  return (
    <StoreProvider>
      <CartProvider>
        <AppShell>
          <ProductDetailsView productId={productId} />
        </AppShell>
      </CartProvider>
    </StoreProvider>
  )
}
