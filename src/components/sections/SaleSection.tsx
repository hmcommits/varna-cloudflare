'use client'
import React, { useState, useEffect } from 'react'
import { useStore } from '@/context/StoreContext'
import ProductCard from '@/components/ui/ProductCard'
import { Flame, Check, Copy } from 'lucide-react'

export default function SaleSection() {
  const { activeStore } = useStore()
  const [copiedCode, setCopiedCode] = useState(false)

  // Scroll into view if #sale hash is targeted
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.toLowerCase() === '#sale') {
      const timer = setTimeout(() => {
        const el = document.getElementById('sale')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 120)
      return () => clearTimeout(timer)
    }
  }, [])

  // Find the first active promotion with curated sale products
  const activeSale = (activeStore.promotions || []).find(
    (p) => p.active && p.saleProducts && p.saleProducts.length > 0
  )

  // If no active sale exists, DO NOT render the sale section on storefront
  if (!activeSale || !activeSale.saleProducts || activeSale.saleProducts.length === 0) {
    return null
  }

  const catalogProducts = activeStore.products || []

  // Map sale products with their custom salePrice
  const saleItems = activeSale.saleProducts
    .map((sp) => {
      const prod = catalogProducts.find((p) => p.id === sp.productId)
      if (!prod) return null
      return {
        product: prod,
        salePrice: sp.salePrice,
      }
    })
    .filter(Boolean) as Array<{
    product: (typeof catalogProducts)[0]
    salePrice: number
  }>

  if (saleItems.length === 0) return null

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  return (
    <section
      id="sale"
      className="scroll-mt-20 py-14 md:py-20 bg-gradient-to-b from-[#faf7f2] via-[#f5ede0] to-[#faf8f5] border-t border-b border-[#ded7cb] relative overflow-hidden"
    >
      {/* Decorative ambient gradient blooms */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#c4855a]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#1c3624]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Sale Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#ded7cb]">
          <div>
            <div className="inline-flex items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#fdf0ef] text-[#b84840] border border-[#fcd8d5] shadow-2xs font-mono">
                <Flame size={13} className="text-[#b84840] animate-pulse" />
                <span>Special Promotion Drop</span>
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#845d1d] text-white shadow-xs">
                {activeSale.discountText}
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#142319] tracking-tight">
              {activeSale.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#6b7770] mt-1.5 max-w-xl">
              Limited-edition archive pieces and season highlights at special promotional prices.
              Direct WhatsApp concierge ordering available for all items.
            </p>
          </div>

          {/* Coupon Code Pill */}
          {activeSale.code && (
            <div className="flex items-center gap-2 self-start md:self-auto bg-white/90 backdrop-blur-xs border border-[#ded7cb] rounded-2xl p-2 px-3.5 shadow-2xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6b7770] tracking-wider block">
                  Promo Code
                </span>
                <span className="text-sm font-bold text-[#142319] font-mono tracking-wider">
                  {activeSale.code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(activeSale.code || '')}
                className="ml-2 px-3 py-1.5 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white text-xs font-bold transition-all shadow-xs active:scale-97 cursor-pointer flex items-center gap-1"
                title="Copy coupon code"
              >
                {copiedCode ? (
                  <>
                    <Check size={12} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Sale Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {saleItems.map(({ product: p, salePrice }) => {
            const primaryImage =
              p.colors?.[0]?.image ||
              'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532655/varna_store/products/linen-shirt-terracotta.webp'

            return (
              <div key={p.id} className="w-full">
                <ProductCard
                  fullWidth
                  id={p.id}
                  name={p.name}
                  image={primaryImage}
                  price={salePrice}
                  originalPrice={p.price > salePrice ? p.price : p.originalPrice}
                  rating={p.rating}
                  reviewCount={p.reviewCount}
                  colors={p.colors.map((c) => c.hex)}
                  badge="Flash Sale"
                  category={p.category}
                  gender={p.gender}
                  customization={p.customization}
                  hasColorPricing={p.hasColorPricing}
                />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
