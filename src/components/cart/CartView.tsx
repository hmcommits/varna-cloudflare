'use client'
import React, { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Truck,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
  ChevronDown,
  MapPin,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'
import { CartItem } from '@/types/store'

export default function CartView() {
  const router = useRouter()
  const { activeStore } = useStore()
  const {
    cart,
    totalItems,
    subtotal,
    deliveryFee,
    isFreeDelivery,
    totalPayable,
    updateQuantity,
    updateCartItemVariant,
    removeFromCart,
    clearCart,
    openCheckout,
    savedAddress,
  } = useCart()

  // Map product map for fast lookup of available colors and sizes
  const productMap = useMemo(() => {
    const map = new Map()
    if (activeStore?.products) {
      for (const p of activeStore.products) {
        map.set(p.id, p)
      }
    }
    return map
  }, [activeStore.products])

  const handleSizeChange = (item: CartItem, newSize: string) => {
    if (newSize === item.size) return
    updateCartItemVariant(item.id, { size: newSize })
  }

  const handleColorChange = (item: CartItem, newColorName: string) => {
    if (newColorName === item.color) return
    const product = productMap.get(item.productId)
    const matchedColor = product?.colors?.find((c: { name: string }) => c.name === newColorName)

    if (matchedColor) {
      updateCartItemVariant(item.id, {
        color: matchedColor.name,
        colorHex: matchedColor.hex,
        image: matchedColor.image || item.image,
        price: matchedColor.price !== undefined ? matchedColor.price : item.price,
        originalPrice:
          matchedColor.originalPrice !== undefined ? matchedColor.originalPrice : item.originalPrice,
      })
    } else {
      updateCartItemVariant(item.id, { color: newColorName })
    }
  }

  const handleCardClick = (productId: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/products/${productId}`
    } else {
      router.push(`/products/${productId}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#1a1a1a] pb-24 lg:pb-16 pt-4 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs & Navigation */}
        <nav className="flex items-center justify-between py-3 mb-4 text-xs font-medium text-[#7d7062]">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#1a2e1a] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-[#1a2e1a] font-bold">Shopping Bag</span>
          </div>

          <Link
            href="/#new-arrivals"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1a2e1a] hover:underline"
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </Link>
        </nav>

        {/* Page Title & Count Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-6 border-b border-[#e8d5b7]/70 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1a1a1a]">
                Your Shopping Bag
              </h1>
              {totalItems > 0 && (
                <span className="bg-[#1a2e1a] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#7d7062] mt-1">
              Review your handcrafted everyday wear and customize sizes or colors before checkout.
            </p>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to clear all items from your bag?')) {
                  clearCart()
                }
              }}
              className="text-xs text-[#9e9080] hover:text-[#c85a44] transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Empty Bag</span>
            </button>
          )}
        </div>

        {/* Free Delivery Banner if qualified */}
        {cart.length > 0 && isFreeDelivery && (
          <div className="mb-6 bg-[#eef7f0] rounded-2xl p-3.5 sm:p-4 border border-[#d6ecda] shadow-xs flex items-center justify-between gap-3 text-xs sm:text-sm text-[#206035] font-semibold">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#d6ecda] text-[#206035] flex items-center justify-center shrink-0">
                <Truck size={16} />
              </div>
              <div>
                <span className="font-bold">100% FREE Pan-India Delivery!</span>
                <span className="block text-[11px] text-[#206035]/80">
                  Zero shipping charges for items in your bag.
                </span>
              </div>
            </div>
            <span className="bg-[#206035] text-white text-xs px-3 py-1 rounded-full font-bold shadow-xs shrink-0">
              FREE SHIPPING
            </span>
          </div>
        )}

        {/* Empty Bag State */}
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#e8d5b7]/70 p-8 sm:p-16 text-center shadow-xs flex flex-col items-center justify-center my-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#faf8f4] border border-[#e8d5b7] flex items-center justify-center text-[#8a7d6e] shadow-xs mb-5">
              <ShoppingBag size={36} className="text-[#8a7d6e]" />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
              Your shopping bag is empty
            </h2>
            <p className="text-xs sm:text-sm text-[#7d7062] max-w-md mt-2 leading-relaxed">
              Looks like you haven&apos;t added any styles yet. Explore our handcrafted linen shirts, heavyweight tees, and hoodies tailored for everyday elegance.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <Link
                href="/#new-arrivals"
                className="px-6 py-3 rounded-full bg-[#1a2e1a] hover:bg-[#25D366] text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              >
                Explore New Arrivals
              </Link>
              <Link
                href="/products"
                className="px-6 py-3 rounded-full bg-white hover:bg-[#faf8f4] text-[#1a2e1a] border border-[#1a2e1a] text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                View Full Catalog
              </Link>
            </div>
          </div>
        ) : (
          /* Main 2-Column Responsive Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 or 8 Columns: Interactive Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-[#7d7062] px-1">
                <span>Products in Bag ({totalItems})</span>
                <span className="hidden sm:inline text-[11px] text-[#9e9080]">
                  Click any item card to open full product description
                </span>
              </div>

              {cart.map((item) => {
                const product = productMap.get(item.productId)
                const availableSizes =
                  product?.sizes && product.sizes.length > 0
                    ? product.sizes
                    : ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
                const availableColors =
                  product?.colors && product.colors.length > 0
                    ? product.colors
                    : [{ id: 'curr', name: item.color, hex: item.colorHex || '#1a1a1a', image: item.image }]

                return (
                  <div
                    key={item.id}
                    onClick={() => handleCardClick(item.productId)}
                    className="relative bg-white rounded-2xl p-4 sm:p-5 border border-[#e8d5b7]/80 shadow-xs hover:shadow-md hover:border-[#1a2e1a]/40 transition-all cursor-pointer group flex flex-col sm:flex-row gap-4 sm:gap-5"
                    title={`Click to view ${item.name} details`}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative w-full sm:w-28 sm:h-36 h-48 rounded-xl overflow-hidden bg-[#f3ede2] shrink-0 border border-[#e8d5b7]/60">
                      <Image
                        src={
                          item.image ||
                          'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532655/varna_store/products/linen-shirt-terracotta.webp'
                        }
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 120px"
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Card Content & Interactive Controls */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Title & Delete Row */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h2 className="font-display text-base sm:text-lg font-bold text-[#1a1a1a] group-hover:text-[#1a2e1a] transition-colors line-clamp-1">
                              {item.name}
                            </h2>
                            <p className="text-xs text-[#7d7062] mt-0.5">
                              {product?.category || 'Apparel'} • {product?.gender || 'Unisex'}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFromCart(item.id)
                            }}
                            className="p-1.5 rounded-lg text-[#9e9080] hover:text-[#c85a44] hover:bg-[#faf8f4] transition-colors cursor-pointer shrink-0"
                            title={`Remove ${item.name}`}
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Interactive Variant Selectors (Size & Color Dropdowns) */}
                        <div
                          className="flex items-center gap-3 sm:gap-4 flex-wrap mt-2.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Size Selector Dropdown */}
                          <div className="flex items-center gap-1.5 bg-[#faf8f4] px-2.5 py-1 rounded-xl border border-[#e8d5b7]">
                            <label className="text-[11px] font-bold text-[#7d7062] uppercase tracking-wider">
                              Size:
                            </label>
                            <div className="relative">
                              <select
                                value={item.size}
                                onChange={(e) => handleSizeChange(item, e.target.value)}
                                className="bg-transparent text-xs font-extrabold text-[#1a1a1a] pr-4 outline-none cursor-pointer appearance-none"
                              >
                                {availableSizes.map((sz: string) => (
                                  <option key={sz} value={sz} className="text-[#1a1a1a] bg-white">
                                    {sz}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                size={12}
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#7d7062] pointer-events-none"
                              />
                            </div>
                          </div>

                          {/* Color Selector Dropdown */}
                          <div className="flex items-center gap-1.5 bg-[#faf8f4] px-2.5 py-1 rounded-xl border border-[#e8d5b7]">
                            <label className="text-[11px] font-bold text-[#7d7062] uppercase tracking-wider">
                              Color:
                            </label>
                            {item.colorHex && (
                              <span
                                className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: item.colorHex }}
                              />
                            )}
                            <div className="relative">
                              <select
                                value={item.color}
                                onChange={(e) => handleColorChange(item, e.target.value)}
                                className="bg-transparent text-xs font-bold text-[#1a1a1a] pr-4 outline-none cursor-pointer appearance-none max-w-[110px] truncate"
                              >
                                {availableColors.map((c: { name: string; hex?: string }) => (
                                  <option key={c.name} value={c.name} className="text-[#1a1a1a] bg-white">
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                size={12}
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#7d7062] pointer-events-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Customization Callout */}
                        {item.customNotes && (
                          <div className="mt-2 bg-[#faf6f0] border border-[#e8d5b7] rounded-xl px-2.5 py-1.5 text-[11px] text-[#845d1d] flex items-center gap-1.5">
                            <Sparkles size={12} className="shrink-0 text-[#845d1d]" />
                            <span className="truncate">
                              Custom: &ldquo;{item.customNotes}&rdquo;
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quantity Stepper & Price Row */}
                      <div className="flex items-center justify-between pt-3 border-t border-[#f0ece4]">
                        {/* Quantity Stepper */}
                        <div
                          className="flex items-center gap-1.5 bg-[#faf8f4] border border-[#e8d5b7] rounded-xl p-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white text-[#1a1a1a] flex items-center justify-center hover:bg-[#e8d5b7]/40 transition-colors shadow-2xs cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-xs font-extrabold text-[#1a1a1a] min-w-[28px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-white text-[#1a1a1a] flex items-center justify-center hover:bg-[#e8d5b7]/40 transition-colors shadow-2xs cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Price Details */}
                        <div className="text-right">
                          <div className="flex items-baseline justify-end gap-2">
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="text-xs text-[#9e9080] line-through">
                                ₹{(item.originalPrice * item.quantity).toLocaleString('en-IN')}
                              </span>
                            )}
                            <span className="font-display font-bold text-base sm:text-lg text-[#1a1a1a]">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                          {item.quantity > 1 && (
                            <span className="text-[11px] text-[#7d7062]">
                              (₹{item.price.toLocaleString('en-IN')} each)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right 4 Columns: Sticky Order Summary Card */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              <div className="bg-white rounded-3xl p-6 border border-[#e8d5b7]/80 shadow-sm space-y-4">
                <h3 className="font-display text-lg font-bold text-[#1a1a1a] pb-3 border-b border-[#e8d5b7]/70">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-xs text-[#63574a]">
                  <div className="flex items-center justify-between">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-bold text-[#1a1a1a]">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Pan-India Shipping</span>
                    {isFreeDelivery ? (
                      <span className="text-emerald-700 font-bold uppercase tracking-wider text-[11px]">
                        FREE
                      </span>
                    ) : (
                      <span className="font-bold text-[#1a1a1a]">
                        +₹{deliveryFee.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#e8d5b7]/60 flex items-baseline justify-between">
                    <div>
                      <span className="font-display font-bold text-base text-[#1a1a1a]">
                        Total Payable
                      </span>
                      <span className="text-[10px] text-[#7d7062] block">
                        (Inclusive of all taxes &amp; GST)
                      </span>
                    </div>
                    <span className="font-display text-2xl font-bold text-[#1a2e1a]">
                      ₹{totalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Saved Address Confirmation */}
                {savedAddress && Boolean(savedAddress.fullName?.trim() && savedAddress.city?.trim()) && (
                  <div className="bg-[#faf8f4] border border-[#e8d5b7] rounded-xl p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1a1a1a] flex items-center gap-1.5">
                        <MapPin size={13} className="text-[#1a2e1a]" />
                        <span>Saved Delivery Address</span>
                      </span>
                      <a
                        href="/checkout"
                        onClick={(e) => {
                          e.preventDefault()
                          openCheckout()
                        }}
                        className="text-[11px] font-bold text-[#1a2e1a] hover:underline cursor-pointer"
                      >
                        Edit
                      </a>
                    </div>
                    <p className="text-[11px] text-[#63574a] leading-tight truncate">
                      {savedAddress.fullName} • {savedAddress.houseNumber ? `${savedAddress.houseNumber}, ` : ''}{savedAddress.city}{savedAddress.state ? `, ${savedAddress.state}` : ''}{savedAddress.pincode ? ` - ${savedAddress.pincode}` : ''}
                    </p>
                  </div>
                )}

                {/* Primary Checkout CTA */}
                <a
                  href="/checkout"
                  onClick={(e) => {
                    e.preventDefault()
                    openCheckout()
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-[#1a2e1a] hover:bg-[#25D366] text-white font-bold text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group text-center"
                >
                  <span>Proceed to Delivery &amp; Checkout</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </a>

                <p className="text-[11px] text-[#7d7062] text-center leading-relaxed">
                  Enter your delivery address on the next step. Order &amp; payment will be verified directly via WhatsApp.
                </p>
              </div>

              {/* Trust & Guarantee Cards */}
              <div className="bg-[#faf8f4] rounded-2xl p-4 border border-[#e8d5b7]/70 space-y-3 text-xs text-[#63574a]">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={16} className="text-[#1a2e1a] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1a1a1a] block">100% Genuine Craftsmanship</strong>
                    <span>Hand-inspected fabric and bespoke precision prints.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MessageCircle size={16} className="text-[#25D366] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1a1a1a] block">Direct WhatsApp Concierge</strong>
                    <span>Real human assistance for sizing and custom requirements.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <RotateCcw size={16} className="text-[#1a2e1a] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#1a1a1a] block">Hassle-Free Size Exchanges</strong>
                    <span>Fit guarantee support on all non-customized pieces.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar for Mobile View */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e8d5b7] p-3.5 shadow-2xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-[#7d7062] uppercase font-bold tracking-wider block">
              Total Payable
            </span>
            <span className="font-display text-lg font-bold text-[#1a2e1a]">
              ₹{totalPayable.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            type="button"
            onClick={openCheckout}
            className="flex-1 py-3 px-5 rounded-xl bg-[#1a2e1a] hover:bg-[#25D366] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
