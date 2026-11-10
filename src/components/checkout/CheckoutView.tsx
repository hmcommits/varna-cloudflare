'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ShoppingBag,
  ExternalLink,
  Phone,
  ArrowRight,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useStore } from '@/context/StoreContext'
import { DeliveryAddress, CartItem } from '@/types/store'

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

export default function CheckoutView() {
  const {
    cart,
    totalItems,
    subtotal,
    deliveryFee,
    isFreeDelivery,
    totalPayable,
    clearCart,
    savedAddress,
    saveAddress,
  } = useCart()

  const { activeStore, logEnquiry } = useStore()

  // Form State initialized with saved address or empty state
  const [formData, setFormData] = useState<DeliveryAddress>({
    fullName: '',
    phoneNumber: '',
    houseNumber: '',
    streetAddress: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    addressType: 'Home',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showMobileSummary, setShowMobileSummary] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState<{
    orderId: string
    whatsappUrl: string
    itemsCount: number
    totalAmount: number
  } | null>(null)

  const isLoadedFromSaved = useRef(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Re-populate from saved address strictly ONCE on mount
  useEffect(() => {
    if (!isLoadedFromSaved.current && savedAddress) {
      setFormData((prev) => ({
        ...prev,
        ...savedAddress,
      }))
      isLoadedFromSaved.current = true
    }
  }, [savedAddress])

  // Debounced auto-save directly to localStorage (1.2s idle) without triggering React context re-renders
  useEffect(() => {
    const hasAnyContent = Boolean(
      formData.fullName.trim() ||
      formData.phoneNumber.trim() ||
      formData.houseNumber.trim() ||
      formData.streetAddress.trim() ||
      formData.landmark.trim() ||
      formData.city.trim() ||
      formData.pincode.trim() ||
      formData.state.trim()
    )

    if (!hasAnyContent) return

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)

    autoSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem('varna_delivery_address', JSON.stringify(formData))
      } catch {
        // Safe storage write
      }
    }, 1200)

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [formData])

  // Target WhatsApp phone resolution
  const rawPhoneDigits =
    activeStore.whatsapp?.phoneNumber?.replace(/\D/g, '') ||
    activeStore.settings?.supportPhone?.replace(/\D/g, '') ||
    '916363145972'
  const targetWhatsAppPhone =
    rawPhoneDigits.length === 10 ? `91${rawPhoneDigits}` : rawPhoneDigits

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter receiver’s full name'
    }

    const cleanPhone = formData.phoneNumber.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length !== 10) {
      newErrors.phoneNumber = 'Enter a valid 10-digit Indian mobile number'
    }

    if (!formData.houseNumber.trim()) {
      newErrors.houseNumber = 'Enter Flat / House No. / Building Name'
    }

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Enter Street / Road / Area / Sector'
    }

    if (!formData.landmark.trim()) {
      newErrors.landmark = 'Nearby landmark is required for accurate Indian courier delivery'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Enter city or town'
    }

    if (!formData.state) {
      newErrors.state = 'Please select your state'
    }

    const cleanPin = formData.pincode.replace(/\D/g, '')
    if (!cleanPin || cleanPin.length !== 6) {
      newErrors.pincode = 'Enter a valid 6-digit PIN code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Generate structured Indian WhatsApp Message
  const buildOrderWhatsAppMessage = (orderId: string, currentCart: CartItem[]) => {
    const siteOrigin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_SITE_URL || '')

    let msg = `🛍️ *NEW ORDER - VARNA APPAREL*\n`
    msg += `*Order Reference:* #${orderId}\n`
    msg += `───────────────────────────\n`
    msg += `📦 *ORDER ITEMS (${totalItems}):*\n\n`

    currentCart.forEach((item, index) => {
      const lineSubtotal = item.price * item.quantity
      const productLink = item.productId
        ? `${siteOrigin}/products/${item.productId}`
        : ''

      msg += `${index + 1}. *${item.name}*\n`
      msg += `   • Shade: *${item.color}*\n`
      msg += `   • Size: *${item.size}*\n`
      msg += `   • Qty: *${item.quantity}* × ₹${item.price.toLocaleString('en-IN')} = ₹${lineSubtotal.toLocaleString('en-IN')}\n`

      if (item.customNotes && item.customNotes.trim()) {
        msg += `   • Customization Note: "${item.customNotes.trim()}"\n`
      }
      if (productLink) {
        msg += `   • Product Link: ${productLink}\n`
      }
      msg += `\n`
    })

    msg += `───────────────────────────\n`
    msg += `💰 *ITEMS SUBTOTAL: ₹${subtotal.toLocaleString('en-IN')}*\n`
    if (isFreeDelivery) {
      msg += `🚚 *DELIVERY: FREE (Pan-India Express)*\n`
    } else {
      msg += `🚚 *DELIVERY CHARGE: ₹${deliveryFee.toLocaleString('en-IN')}*\n`
    }
    msg += `💰 *TOTAL PAYABLE: ₹${totalPayable.toLocaleString('en-IN')}*\n`
    msg += `───────────────────────────\n`
    msg += `📍 *DELIVERY ADDRESS:*\n`
    msg += `• *Receiver:* ${formData.fullName.trim()}\n`
    msg += `• *WhatsApp Mobile:* +91 ${formData.phoneNumber.trim()}\n`
    msg += `• *Flat / House No.:* ${formData.houseNumber.trim()}\n`
    msg += `• *Area / Street:* ${formData.streetAddress.trim()}\n`
    msg += `• *Landmark:* ${formData.landmark.trim()}\n`
    msg += `• *City & State:* ${formData.city.trim()}, ${formData.state}\n`
    msg += `• *PIN Code:* ${formData.pincode.trim()}\n`
    msg += `• *Address Type:* ${formData.addressType}\n`
    msg += `───────────────────────────\n`
    msg += `💬 *Payment Confirmation:*\n`
    msg += `Please confirm product availability and share your UPI QR code or payment link to complete this order.`

    return msg
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) {
      alert('Your shopping bag is empty. Please add items to proceed.')
      return
    }

    if (!validateForm()) {
      // Scroll to the first error
      if (typeof window !== 'undefined') {
        const firstErrorEl = document.querySelector('.text-red-600')
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      return
    }

    setIsSubmitting(true)

    try {
      const orderId = `VAR-${Date.now().toString().slice(-6)}`

      // 1. Save address to localStorage for future frictionless checkouts
      saveAddress(formData)

      // 2. Prepare structured WhatsApp text
      const orderMessage = buildOrderWhatsAppMessage(orderId, cart)
      const whatsappUrl = `https://wa.me/${targetWhatsAppPhone}?text=${encodeURIComponent(
        orderMessage
      )}`

      // 3. Log full rich order to MongoDB & Admin Enquiries tab
      const orderSummaryTitle =
        cart.length === 1
          ? cart[0].name
          : `${cart[0].name} + ${cart.length - 1} more items`

      await logEnquiry({
        id: `ord-${Date.now()}`,
        productName: orderSummaryTitle,
        color: cart.length === 1 ? cart[0].color : 'Multiple Colors',
        size: cart.length === 1 ? cart[0].size : 'Multiple Sizes',
        quantity: totalItems,
        customNotes: cart
          .map((i) => (i.customNotes ? `${i.name}: ${i.customNotes}` : ''))
          .filter(Boolean)
          .join(' | '),
        source: 'WhatsApp Checkout',
        completed: false,
        customerName: formData.fullName.trim(),
        customerPhone: formData.phoneNumber.trim(),
        address: { ...formData },
        items: [...cart],
        totalAmount: totalPayable,
        status: 'New',
      })

      // 4. Set placed state
      setOrderPlaced({
        orderId,
        whatsappUrl,
        itemsCount: totalItems,
        totalAmount: totalPayable,
      })

      // 5. Open WhatsApp in new tab / native app
      if (typeof window !== 'undefined') {
        window.open(whatsappUrl, '_blank')
      }

      // 6. Clear shopping cart
      clearCart()
    } catch (err) {
      console.error('Error placing order:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 1. ORDER CONFIRMATION VIEW
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#faf8f4] text-[#1a1a1a] py-8 sm:py-16 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#e8d5b7] shadow-xl text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center mx-auto mb-4 ring-8 ring-[#25D366]/10">
            <CheckCircle2 size={36} className="text-[#1fb355]" />
          </div>

          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#845d1d] bg-[#fbf5eb] px-3.5 py-1 rounded-full border border-[#ebdcc4] inline-block mb-3">
            Order Reference #{orderPlaced.orderId}
          </span>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
            Your WhatsApp Order is Prepared!
          </h1>

          <p className="text-xs sm:text-sm text-[#63574a] mt-2 max-w-md mx-auto leading-relaxed">
            We have generated your structured Indian order details with receiver address.
            Our Varna concierge is ready to verify product availability and share the UPI QR code.
          </p>

          <div className="bg-[#faf8f4] border border-[#e8d5b7] rounded-2xl p-4 sm:p-5 my-6 text-left space-y-2.5 text-xs text-[#4a4740]">
            <div className="flex items-center justify-between pb-2 border-b border-[#e8d5b7]/60">
              <span className="font-bold text-[#1a1a1a]">Customer Name:</span>
              <span>{formData.fullName}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#e8d5b7]/60">
              <span className="font-bold text-[#1a1a1a]">WhatsApp Contact:</span>
              <span>+91 {formData.phoneNumber}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-[#e8d5b7]/60">
              <span className="font-bold text-[#1a1a1a]">Deliver To:</span>
              <span className="text-right truncate max-w-xs">
                {formData.houseNumber}, {formData.streetAddress}, {formData.city}, {formData.state} - {formData.pincode}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 font-bold text-sm text-[#1a2e1a]">
              <span>Total Payable:</span>
              <span className="font-display text-base">₹{orderPlaced.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={orderPlaced.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1fb355] text-black font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-97"
            >
              <span>Open WhatsApp Chat Now</span>
              <ExternalLink size={15} />
            </a>

            <Link
              href="/products"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-[#ded7cb] hover:bg-[#f0ece4] text-[#1a2e1a] font-bold text-xs sm:text-sm transition-all cursor-pointer text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 2. EMPTY CART VIEW
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf8f4] text-[#1a1a1a] py-12 sm:py-20 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-[#e8d5b7] shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-[#faf8f4] border border-[#e8d5b7] text-[#8a7d6e] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={28} />
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1a1a1a]">
            Your shopping bag is empty
          </h2>
          <p className="text-xs text-[#7d7062] mt-2 leading-relaxed">
            Add your favourite handcrafted linen shirts, oversized tees or custom jerseys before proceeding to checkout.
          </p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1a2e1a] hover:bg-[#25D366] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>Explore Collections</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 3. MAIN DEDICATED CHECKOUT VIEW
  return (
    <div className="min-h-screen bg-[#faf8f4] text-[#1a1a1a] pb-24 lg:pb-16 pt-4 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center justify-between py-3 mb-4 text-xs font-medium text-[#7d7062]">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#1a2e1a] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-[#1a2e1a] transition-colors">
              Shopping Bag
            </Link>
            <span>/</span>
            <span className="text-[#1a2e1a] font-bold">Delivery &amp; Checkout</span>
          </div>

          <a
            href={`tel:${(activeStore.settings?.supportPhone || '+916363145972').replace(/[^0-9+]/g, '')}`}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#1a2e1a] font-semibold hover:underline"
          >
            <Phone size={13} />
            <span>Need Help? Call Concierge</span>
          </a>
        </nav>

        {/* Page Title */}
        <div className="mb-6 sm:mb-8 pb-4 border-b border-[#e8d5b7]/70">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a1a]">
            Delivery Address &amp; WhatsApp Checkout
          </h1>
          <p className="text-xs sm:text-sm text-[#7d7062] mt-1">
            Enter your Indian shipping details. Your order will be structured and dispatched via express courier pan-India.
          </p>
        </div>

        {/* Mobile Collapsible Order Summary Bar */}
        <div className="lg:hidden mb-6 bg-white rounded-2xl border border-[#e8d5b7] p-4 shadow-xs">
          <button
            type="button"
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            className="w-full flex items-center justify-between text-left cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#1a2e1a]" />
              <div>
                <span className="text-xs font-bold text-[#1a1a1a] block">
                  {showMobileSummary ? 'Hide Order Items' : 'View Order Items'} ({totalItems} items)
                </span>
                <span className="text-[11px] text-[#63574a]">
                  Total: <strong className="text-[#1a2e1a]">₹{totalPayable.toLocaleString('en-IN')}</strong>
                  {isFreeDelivery ? ' • Free Delivery' : ` • +₹${deliveryFee} Shipping`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-[#1a2e1a]">
              <span>{showMobileSummary ? 'Collapse' : 'Details'}</span>
              {showMobileSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </button>

          {/* Expanded Mobile Item List */}
          {showMobileSummary && (
            <div className="mt-4 pt-4 border-t border-[#e8d5b7]/60 space-y-3 animate-in fade-in duration-200">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-xs">
                  <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-[#f0ece4] shrink-0 border border-[#e8d5b7]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#1a1a1a] truncate">{item.name}</p>
                    <p className="text-[11px] text-[#7d7062]">
                      {item.color} • Size {item.size} • Qty {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-[#1a1a1a] shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}

              <div className="pt-3 border-t border-[#e8d5b7]/60 space-y-1.5 text-xs text-[#63574a]">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="font-bold text-[#1a1a1a]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pan-India Courier Delivery:</span>
                  {isFreeDelivery ? (
                    <span className="font-bold text-emerald-700">FREE</span>
                  ) : (
                    <span className="font-bold text-[#1a1a1a]">+₹{deliveryFee.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm font-bold text-[#1a2e1a] pt-1 border-t border-[#e8d5b7]/40">
                  <span>Total Payable:</span>
                  <span>₹{totalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Delivery Address Form (7 Cols) */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmitOrder} className="bg-white rounded-3xl p-5 sm:p-8 border border-[#e8d5b7] shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#e8d5b7]/70">
                <MapPin size={18} className="text-[#1a2e1a]" />
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#1a1a1a]">
                  Indian Delivery Address
                </h2>
              </div>

              {/* Full Name & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1a1a1a] mb-1.5">
                    Full Name (Receiver&apos;s Name) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value })
                      if (errors.fullName) setErrors({ ...errors, fullName: '' })
                    }}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full bg-[#faf8f5] focus:bg-white border-2 ${
                      errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-[#ded7cb] focus:border-[#1a2e1a]'
                    } rounded-xl px-4 py-3 text-base text-[#1a1a1a] placeholder-[#9e9080] outline-none transition-all shadow-inner`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1a1a1a] mb-1.5">
                    10-Digit Mobile / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sm font-extrabold text-[#7d7062]">
                      +91
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      autoComplete="tel"
                      maxLength={10}
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10)
                        setFormData({ ...formData, phoneNumber: digitsOnly })
                        if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' })
                      }}
                      className={`w-full bg-[#faf8f5] focus:bg-white border-2 ${
                        errors.phoneNumber ? 'border-red-400 bg-red-50/20' : 'border-[#ded7cb] focus:border-[#1a2e1a]'
                      } rounded-xl pl-12 pr-4 py-3 text-base font-bold text-[#1a1a1a] outline-none transition-all font-mono shadow-inner`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-600 mt-1">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* Flat / House Number */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1a1a1a] mb-1.5">
                  Flat / House No. / Building / Apartment <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoComplete="address-line1"
                  value={formData.houseNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, houseNumber: e.target.value })
                    if (errors.houseNumber) setErrors({ ...errors, houseNumber: '' })
                  }}
                  placeholder="e.g. Flat 402, Lotus Residency, 3rd Floor"
                  className={`w-full bg-[#faf8f5] focus:bg-white border-2 ${
                    errors.houseNumber ? 'border-red-400 bg-red-50/20' : 'border-[#ded7cb] focus:border-[#1a2e1a]'
                  } rounded-xl px-4 py-3 text-base text-[#1a1a1a] placeholder-[#9e9080] outline-none transition-all shadow-inner`}
                />
                {errors.houseNumber && (
                  <p className="text-xs text-red-600 mt-1">{errors.houseNumber}</p>
                )}
              </div>

              {/* Street Address / Area */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#1a1a1a] mb-1.5">
                  Street / Road / Area / Colony / Sector <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoComplete="address-line2"
                  value={formData.streetAddress}
                  onChange={(e) => {
                    setFormData({ ...formData, streetAddress: e.target.value })
                    if (errors.streetAddress) setErrors({ ...errors, streetAddress: '' })
                  }}
                  placeholder="e.g. 100ft Road, Indiranagar 2nd Stage"
                  className={`w-full bg-[#faf8f5] focus:bg-white border-2 ${
                    errors.streetAddress ? 'border-red-400 bg-red-50/20' : 'border-[#ded7cb] focus:border-[#1a2e1a]'
                  } rounded-xl px-4 py-3 text-base text-[#1a1a1a] placeholder-[#9e9080] outline-none transition-all shadow-inner`}
                />
                {errors.streetAddress && (
                  <p className="text-xs text-red-600 mt-1">{errors.streetAddress}</p>
                )}
              </div>

              {/* Landmark */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs sm:text-sm font-bold text-[#1a1a1a]">
                    Nearby Landmark <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#845d1d] font-semibold bg-[#fef6e7] px-2 py-0.5 rounded-md border border-[#fae4ba]">
                    Crucial for Indian couriers
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={formData.landmark}
                  onChange={(e) => {
                    setFormData({ ...formData, landmark: e.target.value })
                    if (errors.landmark) setErrors({ ...errors, landmark: '' })
                  }}
                  placeholder="e.g. Near Apollo Pharmacy, Opposite SBI Bank, Behind Metro Station"
                  className={`w-full bg-[#faf8f5] focus:bg-white border-2 ${
                    errors.landmark ? 'border-red-400 bg-red-50/20' : 'border-[#ded7cb] focus:border-[#1a2e1a]'
                  } rounded-xl px-4 py-3 text-base text-[#1a1a1a] placeholder-[#9e9080] outline-none transition-all shadow-inner`}
                />
                {errors.landmark && (
                  <p className="text-xs text-red-600 mt-1">{errors.landmark}</p>
                )}
              </div>

              {/* City, State & PIN Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* City */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1a1a1a] mb-1.5">
                    City / Town <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="address-level2"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value })
                      if (errors.city) setErrors({ ...errors, city: '' })
                    }}
                    placeholder="e.g. Bengaluru"
                    className={`w-full bg-[#faf8f5] focus:bg-white border-2 ${
                      errors.city ? 'border-red-400 bg-red-50/20' : 'border-[#ded7cb] focus:border-[#1a2e1a]'
                    } rounded-xl px-4 py-3 text-base text-[#1a1a1a] placeholder-[#9e9080] outline-none transition-all shadow-inner`}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-600 mt-1">{errors.city}</p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1a1a1a] mb-1.5">
                    State / UT <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value })
                      if (errors.state) setErrors({ ...errors, state: '' })
                    }}
                    className={`w-full bg-[#faf8f5] focus:bg-white border-2 ${
                      errors.state ? 'border-red-400 bg-red-50/20' : 'border-[#ded7cb] focus:border-[#1a2e1a]'
                    } rounded-xl px-3.5 py-3 text-base text-[#1a1a1a] outline-none transition-all cursor-pointer shadow-inner`}
                  >
                    <option value="" disabled>
                      -- Select State / UT --
                    </option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state} className="text-[#1a1a1a]">
                        {state}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="text-xs text-red-600 mt-1">{errors.state}</p>
                  )}
                </div>

                {/* PIN Code */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#1a1a1a] mb-1.5">
                    PIN Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    autoComplete="postal-code"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => {
                      const cleanPin = e.target.value.replace(/\D/g, '').slice(0, 6)
                      setFormData({ ...formData, pincode: cleanPin })
                      if (errors.pincode) setErrors({ ...errors, pincode: '' })
                    }}
                    placeholder="e.g. 560038"
                    className={`w-full bg-[#faf8f5] focus:bg-white border-2 ${
                      errors.pincode ? 'border-red-400 bg-red-50/20' : 'border-[#ded7cb] focus:border-[#1a2e1a]'
                    } rounded-xl px-4 py-3 text-base font-bold text-[#1a1a1a] outline-none transition-all font-mono shadow-inner`}
                  />
                  {errors.pincode && (
                    <p className="text-xs text-red-600 mt-1">{errors.pincode}</p>
                  )}
                </div>
              </div>

              {/* Address Type Pill Selector */}
              <div className="pt-2">
                <label className="block text-xs sm:text-sm font-bold text-[#1a1a1a] mb-2">
                  Address Type
                </label>
                <div className="flex items-center gap-2.5">
                  {(['Home', 'Work', 'Other'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, addressType: type })}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border-2 ${
                        formData.addressType === type
                          ? 'bg-[#1a2e1a] text-white border-[#1a2e1a] shadow-xs'
                          : 'bg-[#faf8f5] text-[#63574a] border-[#ded7cb] hover:border-[#1a2e1a] hover:bg-white'
                      }`}
                    >
                      {type === 'Home' ? '🏠 Home' : type === 'Work' ? '🏢 Work / Office' : '📍 Other'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA Button (Mobile & Desktop) */}
              <div className="pt-4 border-t border-[#e8d5b7]/60 space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#1fb355] text-black font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <ShoppingBag size={20} />
                  <span>
                    {isSubmitting
                      ? 'Generating Order...'
                      : `Place Order via WhatsApp • ₹${totalPayable.toLocaleString('en-IN')}`}
                  </span>
                </button>

                <p className="text-center text-[11px] text-[#7d7062] flex items-center justify-center gap-1.5">
                  <Lock size={12} className="text-[#1a2e1a]" />
                  <span>No payment charged now • Pay securely via UPI upon chat confirmation</span>
                </p>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Order Summary Card (5 Cols on Desktop) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Order Items Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#e8d5b7] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e8d5b7]/70">
                <h3 className="font-display text-base sm:text-lg font-bold text-[#1a1a1a]">
                  Order Items ({totalItems})
                </h3>
                <Link
                  href="/cart"
                  className="text-xs font-bold text-[#1a2e1a] hover:underline cursor-pointer"
                >
                  Edit Bag
                </Link>
              </div>

              {/* Items List */}
              <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 text-xs pb-3 border-b border-[#f0ece4] last:border-b-0">
                    <div className="relative w-14 h-18 rounded-xl overflow-hidden bg-[#f0ece4] shrink-0 border border-[#e8d5b7]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1a1a1a] truncate text-sm">{item.name}</p>
                      <p className="text-[#7d7062] mt-0.5">
                        Shade: <strong className="text-[#1a1a1a]">{item.color}</strong> • Size: <strong className="text-[#1a1a1a]">{item.size}</strong>
                      </p>
                      <p className="text-[#7d7062] mt-0.5">
                        Qty: <strong className="text-[#1a1a1a]">{item.quantity}</strong> × ₹{item.price.toLocaleString('en-IN')}
                      </p>
                      {item.customNotes && (
                        <p className="text-[10px] text-[#845d1d] mt-1 bg-[#fef6e7] px-2 py-0.5 rounded-md border border-[#fae4ba] line-clamp-2">
                          Note: {item.customNotes}
                        </p>
                      )}
                    </div>
                    <span className="font-bold text-[#1a1a1a] text-sm shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Billing Breakdown */}
              <div className="pt-3 border-t border-[#e8d5b7]/70 space-y-2 text-xs text-[#63574a]">
                <div className="flex items-center justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-[#1a1a1a]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Pan-India Courier Shipping</span>
                  {isFreeDelivery ? (
                    <span className="font-bold text-emerald-700 uppercase text-[11px]">
                      FREE
                    </span>
                  ) : (
                    <span className="font-bold text-[#1a1a1a]">
                      +₹{deliveryFee.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-[#e8d5b7]/70 flex items-baseline justify-between">
                  <div>
                    <span className="font-display font-bold text-base text-[#1a1a1a] block">
                      Total Amount
                    </span>
                    <span className="text-[10px] text-[#7d7062]">
                      (Inclusive of all taxes &amp; GST)
                    </span>
                  </div>
                  <span className="font-display text-2xl font-bold text-[#1a2e1a]">
                    ₹{totalPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Varna Trust & Assurance Card */}
            <div className="bg-[#faf8f4] rounded-2xl p-4 border border-[#e8d5b7] space-y-2.5 text-xs text-[#63574a]">
              <div className="flex items-center gap-2 font-bold text-[#1a2e1a]">
                <ShieldCheck size={16} />
                <span>Varna Concierge Guarantee</span>
              </div>
              <ul className="space-y-1 text-[11px] list-disc list-inside text-[#7d7062]">
                <li>Doorstep size exchange available pan-India.</li>
                <li>Pre-washed authentic pure fabrics with zero shrinkage.</li>
                <li>Live human support for color matching and custom embroidery.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
