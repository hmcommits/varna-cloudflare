'use client'
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  X,
  MapPin,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
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

export default function CheckoutModal() {
  const {
    cart,
    totalItems,
    subtotal,
    deliveryFee,
    isFreeDelivery,
    totalPayable,
    isCheckoutOpen,
    closeCheckout,
    openCart,
    clearCart,
    savedAddress,
    saveAddress,
  } = useCart()

  const { activeStore, logEnquiry } = useStore()

  // Form State initialized with saved address or empty state for user selection
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
  const [showOrderSummary, setShowOrderSummary] = useState(false)
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

  // Debounced auto-save directly to localStorage without triggering React context re-renders
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

  // Prevent background scroll
  useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setOrderPlaced(null)
      setErrors({})
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCheckoutOpen])

  if (!isCheckoutOpen) return null

  // Support phone resolution
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
      alert('Your cart is empty. Please add items to proceed.')
      closeCheckout()
      return
    }

    if (!validateForm()) {
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

      // 5. Open WhatsApp in new tab
      if (typeof window !== 'undefined') {
        window.open(whatsappUrl, '_blank')
      }

      // 6. Clear current shopping cart
      clearCart()
    } catch (err) {
      console.error('Error placing order:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeCheckout}
      />

      <div className="min-h-screen px-4 text-center flex items-center justify-center py-6 sm:py-10">
        <div className="inline-block w-full max-w-2xl bg-[#faf8f4] text-left align-middle transition-all transform shadow-2xl rounded-3xl border border-[#e8d5b7] overflow-hidden relative z-10 text-[#1a1a1a]">
          {/* SUCCESS SCREEN */}
          {orderPlaced ? (
            <div className="p-6 sm:p-10 text-center space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1a2e1a] text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <CheckCircle2 size={36} className="text-[#25D366]" />
              </div>

              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#845d1d] font-mono">
                  ORDER REGISTERED
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1a1a1a] mt-1">
                  Order #{orderPlaced.orderId} Placed!
                </h2>
                <p className="text-xs sm:text-sm text-[#63574a] max-w-md mx-auto mt-2 leading-relaxed">
                  Your order details and Indian delivery address have been transferred to Varna Concierge on WhatsApp.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e8d5b7] max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between text-[#7d7062]">
                  <span>Items Ordered:</span>
                  <span className="font-bold text-[#1a1a1a]">
                    {orderPlaced.itemsCount} units
                  </span>
                </div>
                <div className="flex justify-between text-[#7d7062]">
                  <span>Total Amount:</span>
                  <span className="font-bold text-[#1a2e1a] text-sm">
                    ₹{orderPlaced.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#7d7062]">
                  <span>Payment Method:</span>
                  <span className="font-bold text-[#1a1a1a]">
                    UPI / Payment Link via WhatsApp
                  </span>
                </div>
                <div className="pt-2 border-t border-[#f0ece4] flex justify-between text-[#7d7062]">
                  <span>Delivery Address:</span>
                  <span className="font-medium text-[#1a1a1a] text-right max-w-[200px] truncate">
                    {formData.houseNumber}, {formData.city} - {formData.pincode}
                  </span>
                </div>
              </div>

              <div className="space-y-3 max-w-md mx-auto">
                <a
                  href={orderPlaced.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <div className="relative w-5 h-5 flex-shrink-0">
                    <Image
                      src="https://res.cloudinary.com/o6jv6xte/image/upload/v1793532654/varna_store/icons/whatsapp-icon.webp"
                      alt="WhatsApp"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span>Tap to Open WhatsApp Chat</span>
                  <ExternalLink size={16} />
                </a>

                <button
                  type="button"
                  onClick={closeCheckout}
                  className="w-full py-2.5 text-xs font-semibold text-[#7d7062] hover:text-[#1a1a1a] transition-colors cursor-pointer"
                >
                  Return to Storefront
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM SCREEN */
            <div>
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-white border-b border-[#e8d5b7]/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={openCart}
                    className="w-8 h-8 rounded-full bg-[#faf8f4] hover:bg-[#e8d5b7]/40 text-[#7d7062] flex items-center justify-center transition-colors cursor-pointer"
                    title="Back to Bag"
                    aria-label="Back to Bag"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-[#1a1a1a] leading-none">
                      Checkout &amp; Delivery Address
                    </h2>
                    <span className="text-[11px] text-[#7d7062] font-medium">
                      Pan-India Express Delivery • WhatsApp Payment
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeCheckout}
                  className="w-8 h-8 rounded-full bg-[#faf8f4] hover:bg-[#e8d5b7]/40 text-[#7d7062] flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Order Mini-Summary Dropdown */}
              <div className="bg-[#f5f0e6] border-b border-[#e8d5b7] px-4 sm:px-6 py-3">
                <button
                  type="button"
                  onClick={() => setShowOrderSummary(!showOrderSummary)}
                  className="w-full flex items-center justify-between text-xs font-bold text-[#1a2e1a] cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={14} className="text-[#845d1d]" />
                    <span>
                      Order Summary ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                    </span>
                    <span className="text-sm font-display font-bold text-[#1a1a1a] ml-1">
                      • ₹{totalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#845d1d]">
                    <span>{showOrderSummary ? 'Hide' : 'View'} Items</span>
                    {showOrderSummary ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </button>

                {showOrderSummary && (
                  <div className="pt-3 mt-3 border-t border-[#e8d5b7]/60 space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold text-[#1a1a1a] text-xs">
                            {item.quantity}×
                          </span>
                          <span className="truncate text-[#3d362e] max-w-[220px] sm:max-w-[320px]">
                            {item.name} ({item.color}, {item.size})
                          </span>
                        </div>
                        <span className="font-bold text-[#1a1a1a] whitespace-nowrap">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-[#e8d5b7]/60 flex items-center justify-between text-xs font-semibold text-[#63574a]">
                      <span>Items Subtotal:</span>
                      <span className="font-bold text-[#1a1a1a]">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold text-[#63574a]">
                      <span>Pan-India Delivery:</span>
                      {isFreeDelivery ? (
                        <span className="text-emerald-700 font-bold uppercase text-[10px]">
                          FREE
                        </span>
                      ) : (
                        <span className="font-bold text-[#1a1a1a]">
                          +₹{deliveryFee.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <div className="pt-1.5 border-t border-[#e8d5b7]/60 flex items-center justify-between text-xs font-bold text-[#1a2e1a]">
                      <span>Total Amount:</span>
                      <span>₹{totalPayable.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Indian Address Form */}
              <form onSubmit={handleSubmitOrder} className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-1.5 pb-1">
                  <MapPin size={16} className="text-[#1a2e1a]" />
                  <h3 className="font-display text-sm sm:text-base font-bold text-[#1a1a1a]">
                    Receiver Information &amp; Delivery Details
                  </h3>
                </div>

                {/* Receiver Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value })
                        if (errors.fullName) setErrors({ ...errors, fullName: '' })
                      }}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full bg-white border ${
                        errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-[#e8d5b7]'
                      } rounded-xl px-3.5 py-2.5 text-xs text-[#1a1a1a] placeholder-[#9e9080] outline-none focus:border-[#1a2e1a] focus:ring-1 focus:ring-[#1a2e1a]`}
                    />
                    {errors.fullName && (
                      <p className="text-[10px] text-red-600 mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">
                      10-Digit Mobile / WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-bold text-[#7d7062]">
                        +91
                      </div>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={formData.phoneNumber}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10)
                          setFormData({ ...formData, phoneNumber: digitsOnly })
                          if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' })
                        }}
                        className={`w-full bg-white border ${
                          errors.phoneNumber ? 'border-red-400 bg-red-50/20' : 'border-[#e8d5b7]'
                        } rounded-xl pl-12 pr-3.5 py-2.5 text-xs text-[#1a1a1a] placeholder-[#9e9080] outline-none focus:border-[#1a2e1a] focus:ring-1 focus:ring-[#1a2e1a] font-mono`}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-[10px] text-red-600 mt-1">{errors.phoneNumber}</p>
                    )}
                  </div>
                </div>

                {/* Flat / House No / Apartment */}
                <div>
                  <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">
                    Flat, House No., Building / Apartment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.houseNumber}
                    onChange={(e) => {
                      setFormData({ ...formData, houseNumber: e.target.value })
                      if (errors.houseNumber) setErrors({ ...errors, houseNumber: '' })
                    }}
                    placeholder="e.g. Flat 304, Green Heights Apartment"
                    className={`w-full bg-white border ${
                      errors.houseNumber ? 'border-red-400 bg-red-50/20' : 'border-[#e8d5b7]'
                    } rounded-xl px-3.5 py-2.5 text-xs text-[#1a1a1a] placeholder-[#9e9080] outline-none focus:border-[#1a2e1a] focus:ring-1 focus:ring-[#1a2e1a]`}
                  />
                  {errors.houseNumber && (
                    <p className="text-[10px] text-red-600 mt-1">{errors.houseNumber}</p>
                  )}
                </div>

                {/* Street, Area, Colony */}
                <div>
                  <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">
                    Area, Street, Sector, Road or Colony <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.streetAddress}
                    onChange={(e) => {
                      setFormData({ ...formData, streetAddress: e.target.value })
                      if (errors.streetAddress) setErrors({ ...errors, streetAddress: '' })
                    }}
                    placeholder="e.g. 100ft Road, Indiranagar 2nd Stage"
                    className={`w-full bg-white border ${
                      errors.streetAddress ? 'border-red-400 bg-red-50/20' : 'border-[#e8d5b7]'
                    } rounded-xl px-3.5 py-2.5 text-xs text-[#1a1a1a] placeholder-[#9e9080] outline-none focus:border-[#1a2e1a] focus:ring-1 focus:ring-[#1a2e1a]`}
                  />
                  {errors.streetAddress && (
                    <p className="text-[10px] text-red-600 mt-1">{errors.streetAddress}</p>
                  )}
                </div>

                {/* Landmark - Indian Specific Essential */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#1a1a1a]">
                      Nearby Landmark <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-[#845d1d] font-semibold">
                      Crucial for courier delivery
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
                    className={`w-full bg-white border ${
                      errors.landmark ? 'border-red-400 bg-red-50/20' : 'border-[#e8d5b7]'
                    } rounded-xl px-3.5 py-2.5 text-xs text-[#1a1a1a] placeholder-[#9e9080] outline-none focus:border-[#1a2e1a] focus:ring-1 focus:ring-[#1a2e1a]`}
                  />
                  {errors.landmark && (
                    <p className="text-[10px] text-red-600 mt-1">{errors.landmark}</p>
                  )}
                </div>

                {/* City, State, PIN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">
                      City / Town <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => {
                        setFormData({ ...formData, city: e.target.value })
                        if (errors.city) setErrors({ ...errors, city: '' })
                      }}
                      placeholder="e.g. Bengaluru"
                      className={`w-full bg-white border ${
                        errors.city ? 'border-red-400 bg-red-50/20' : 'border-[#e8d5b7]'
                      } rounded-xl px-3.5 py-2.5 text-xs text-[#1a1a1a] placeholder-[#9e9080] outline-none focus:border-[#1a2e1a] focus:ring-1 focus:ring-[#1a2e1a]`}
                    />
                    {errors.city && (
                      <p className="text-[10px] text-red-600 mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => {
                        setFormData({ ...formData, state: e.target.value })
                        if (errors.state) setErrors({ ...errors, state: '' })
                      }}
                      className={`w-full bg-white border ${
                        errors.state ? 'border-red-400 bg-red-50/20' : 'border-[#e8d5b7]'
                      } rounded-xl px-3 py-2.5 text-xs text-[#1a1a1a] outline-none focus:border-[#1a2e1a] focus:ring-1 focus:ring-[#1a2e1a] cursor-pointer`}
                    >
                      <option value="">-- Select State / Union Territory --</option>
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-[10px] text-red-600 mt-1">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">
                      PIN Code (6 Digits) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6)
                        setFormData({ ...formData, pincode: digitsOnly })
                        if (errors.pincode) setErrors({ ...errors, pincode: '' })
                      }}
                      placeholder="e.g. 560038"
                      className={`w-full bg-white border ${
                        errors.pincode ? 'border-red-400 bg-red-50/20' : 'border-[#e8d5b7]'
                      } rounded-xl px-3.5 py-2.5 text-xs text-[#1a1a1a] placeholder-[#9e9080] outline-none focus:border-[#1a2e1a] focus:ring-1 focus:ring-[#1a2e1a] font-mono`}
                    />
                    {errors.pincode && (
                      <p className="text-[10px] text-red-600 mt-1">{errors.pincode}</p>
                    )}
                  </div>
                </div>

                {/* Address Type */}
                <div>
                  <label className="block text-xs font-semibold text-[#1a1a1a] mb-1.5">
                    Address Type
                  </label>
                  <div className="flex items-center gap-2">
                    {(['Home', 'Work', 'Other'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, addressType: type })}
                        className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          formData.addressType === type
                            ? 'bg-[#1a2e1a] text-white border-[#1a2e1a] shadow-xs'
                            : 'bg-white text-[#63574a] border-[#e8d5b7] hover:border-[#1a2e1a]/40'
                        }`}
                      >
                        {type === 'Home' ? '🏠 Home' : type === 'Work' ? '🏢 Work / Office' : '📍 Other'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Security & Logistics Banner */}
                <div className="bg-[#f0ece4]/70 rounded-2xl p-3 border border-[#e8d5b7]/70 flex items-center justify-between text-[11px] text-[#63574a]">
                  <div className="flex items-center gap-1.5 text-[#1e4a36] font-semibold">
                    <Truck size={14} />
                    <span>Express Pan-India Delivery</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#845d1d] font-semibold">
                    <ShieldCheck size={14} />
                    <span>Pay via UPI on WhatsApp</span>
                  </div>
                </div>

                {/* SUBMIT BUTTON: PLACE ORDER VIA WHATSAPP */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 bg-[#1a2e1a] hover:bg-[#25D366] text-white rounded-2xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                  >
                    <div className="relative w-5 h-5 flex-shrink-0">
                      <Image
                        src="https://res.cloudinary.com/o6jv6xte/image/upload/v1793532654/varna_store/icons/whatsapp-icon.webp"
                        alt="WhatsApp"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span>
                      {isSubmitting
                        ? 'Preparing WhatsApp Order...'
                        : `Place Order via WhatsApp • ₹${totalPayable.toLocaleString('en-IN')}`}
                    </span>
                  </button>

                  <p className="text-[11px] text-[#7d7062] text-center flex items-center justify-center gap-1">
                    <Lock size={11} className="text-[#845d1d]" />
                    <span>
                      Order is instantly logged &amp; opened in WhatsApp with Varna Concierge
                    </span>
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
