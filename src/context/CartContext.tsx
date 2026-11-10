'use client'
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { CartItem, DeliveryAddress } from '@/types/store'
import { useStore } from '@/context/StoreContext'

interface CartContextType {
  cart: CartItem[]
  totalItems: number
  subtotal: number
  deliveryFee: number
  isFreeDelivery: boolean
  totalPayable: number
  freeThreshold: number
  amountToFreeDelivery: number
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  openCart: () => void
  closeCart: () => void
  isCheckoutOpen: boolean
  setIsCheckoutOpen: (open: boolean) => void
  openCheckout: () => void
  closeCheckout: () => void
  addToCart: (item: Omit<CartItem, 'id'>, openCartDrawer?: boolean) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, newQty: number) => void
  updateCartItemVariant: (
    id: string,
    updates: {
      size?: string
      color?: string
      colorHex?: string
      image?: string
      price?: number
      originalPrice?: number
    }
  ) => void
  clearCart: () => void
  savedAddress: DeliveryAddress | null
  saveAddress: (addr: DeliveryAddress) => void
  isBagAnimating: boolean
  triggerBagAnimation: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'varna_cart_items'
const ADDRESS_STORAGE_KEY = 'varna_delivery_address'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { activeStore } = useStore()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [savedAddress, setSavedAddress] = useState<DeliveryAddress | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [isBagAnimating, setIsBagAnimating] = useState(false)
  const bagTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Bag bounce / glow animation trigger
  const triggerBagAnimation = useCallback(() => {
    setIsBagAnimating(true)
    if (bagTimerRef.current) clearTimeout(bagTimerRef.current)
    bagTimerRef.current = setTimeout(() => {
      setIsBagAnimating(false)
    }, 1200)
  }, [])

  useEffect(() => {
    return () => {
      if (bagTimerRef.current) clearTimeout(bagTimerRef.current)
    }
  }, [])

  // Helper to synchronously write cart to browser localStorage
  const persistCart = useCallback((newCart: CartItem[]) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart))
    } catch (err) {
      console.warn('Could not save cart to storage:', err)
    }
  }, [])

  // Rehydrate cart and address from localStorage on client mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (storedCart) {
        const parsed = JSON.parse(storedCart)
        if (Array.isArray(parsed)) {
          setCart(parsed)
        }
      }

      const storedAddress = localStorage.getItem(ADDRESS_STORAGE_KEY)
      if (storedAddress) {
        const parsedAddr = JSON.parse(storedAddress)
        if (parsedAddr && typeof parsedAddr === 'object') {
          setSavedAddress(parsedAddr)
        }
      }
    } catch (err) {
      console.warn('Could not rehydrate cart from storage:', err)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Real-time synchronization across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed)) setCart(parsed)
        } catch {
          // Ignore parse errors from other sources
        }
      }
      if (e.key === ADDRESS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (parsed && typeof parsed === 'object') setSavedAddress(parsed)
        } catch {
          // Ignore parse errors
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Persist cart to localStorage whenever it changes (after initial hydration)
  useEffect(() => {
    if (!isHydrated) return
    persistCart(cart)
  }, [cart, isHydrated, persistCart])

  const openCart = useCallback(() => {
    setIsCheckoutOpen(false)
    setIsCartOpen(false)
    if (typeof window !== 'undefined') {
      window.location.href = '/cart'
    }
  }, [])

  const closeCart = useCallback(() => {
    setIsCartOpen(false)
  }, [])

  const openCheckout = useCallback(() => {
    setIsCartOpen(false)
    setIsCheckoutOpen(false)
    if (typeof window !== 'undefined') {
      window.location.href = '/checkout'
    }
  }, [])

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false)
  }, [])

  const saveAddress = useCallback((addr: DeliveryAddress) => {
    setSavedAddress(addr)
    try {
      localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(addr))
    } catch (err) {
      console.warn('Could not save delivery address:', err)
    }
  }, [])

  const addToCart = useCallback(
    (item: Omit<CartItem, 'id'>, openCartDrawer = false) => {
      // Normalize unique key based on product ID, color, size, and custom notes
      const normalizedNotes = (item.customNotes || '').trim().toLowerCase()
      const normalizedAddOns = (item.customAddOns || []).sort().join('|')
      const uniqueId = `${item.productId}_${item.color}_${item.size}_${normalizedNotes}_${normalizedAddOns}`
        .replace(/\s+/g, '-')
        .toLowerCase()

      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex((ci) => ci.id === uniqueId)
        if (existingIndex > -1) {
          // Increase quantity of existing line item
          const updated = [...prevCart]
          const existing = updated[existingIndex]
          updated[existingIndex] = {
            ...existing,
            quantity: existing.quantity + item.quantity,
          }
          return updated
        }

        // Add brand new item
        return [
          {
            ...item,
            id: uniqueId,
          },
          ...prevCart,
        ]
      })

      // Trigger the navbar shopping bag blink / bounce animation
      triggerBagAnimation()

      if (openCartDrawer) {
        if (typeof window !== 'undefined') {
          window.location.href = '/cart'
        }
      }
    },
    [triggerBagAnimation]
  )

  const removeFromCart = useCallback((id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id))
      return
    }

    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity: Math.min(99, newQty) } : item))
    )
  }, [])

  // Update Size or Color for an item directly from the Cart
  const updateCartItemVariant = useCallback(
    (
      id: string,
      updates: {
        size?: string
        color?: string
        colorHex?: string
        image?: string
        price?: number
        originalPrice?: number
      }
    ) => {
      setCart((prevCart) => {
        const itemIndex = prevCart.findIndex((ci) => ci.id === id)
        if (itemIndex === -1) return prevCart

        const item = prevCart[itemIndex]
        const newSize = updates.size !== undefined ? updates.size : item.size
        const newColor = updates.color !== undefined ? updates.color : item.color
        const newColorHex = updates.colorHex !== undefined ? updates.colorHex : item.colorHex
        const newImage = updates.image !== undefined ? updates.image : item.image
        const newPrice = updates.price !== undefined ? updates.price : item.price
        const newOriginalPrice =
          updates.originalPrice !== undefined ? updates.originalPrice : item.originalPrice

        const normalizedNotes = (item.customNotes || '').trim().toLowerCase()
        const normalizedAddOns = (item.customAddOns || []).sort().join('|')
        const newUniqueId = `${item.productId}_${newColor}_${newSize}_${normalizedNotes}_${normalizedAddOns}`
          .replace(/\s+/g, '-')
          .toLowerCase()

        if (newUniqueId === id) {
          const updated = [...prevCart]
          updated[itemIndex] = {
            ...item,
            size: newSize,
            color: newColor,
            colorHex: newColorHex,
            image: newImage,
            price: newPrice,
            originalPrice: newOriginalPrice,
          }
          return updated
        }

        // If another item with newUniqueId exists in cart, merge quantities
        const existingOtherIndex = prevCart.findIndex((ci) => ci.id === newUniqueId)
        if (existingOtherIndex > -1) {
          return prevCart
            .filter((ci) => ci.id !== id)
            .map((ci) =>
              ci.id === newUniqueId
                ? { ...ci, quantity: ci.quantity + item.quantity }
                : ci
            )
        }

        // Update item with new ID and variant details
        const updated = [...prevCart]
        updated[itemIndex] = {
          ...item,
          id: newUniqueId,
          size: newSize,
          color: newColor,
          colorHex: newColorHex,
          image: newImage,
          price: newPrice,
          originalPrice: newOriginalPrice,
        }
        return updated
      })
    },
    []
  )

  const clearCart = useCallback(() => {
    setCart([])
    try {
      localStorage.removeItem(CART_STORAGE_KEY)
    } catch (err) {
      console.warn('Could not clear cart storage:', err)
    }
  }, [])

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cart])

  // Product-Level Shipping Charges Engine: Calculates total shipping by summing fees for all items/units
  const deliveryPolicy = useMemo(() => {
    if (cart.length === 0) {
      return {
        deliveryFee: 0,
        isFreeDelivery: true,
        totalPayable: 0,
        freeThreshold: 0,
        amountToFreeDelivery: 0,
      }
    }

    const storeProducts = activeStore?.products || []

    // Calculate total shipping fee: sum of shipping charges for each unit in the cart
    let totalShippingFee = 0

    for (const item of cart) {
      const liveProduct = storeProducts.find((p) => p.id === item.productId)

      // Check item's stored shipping properties, falling back to live store product
      const isCharged =
        item.chargeShipping !== undefined
          ? Boolean(item.chargeShipping)
          : Boolean(liveProduct?.chargeShipping)

      const fee =
        item.shippingCharges !== undefined
          ? Number(item.shippingCharges) || 0
          : Number(liveProduct?.shippingCharges) || 0

      if (isCharged && fee > 0) {
        totalShippingFee += fee * (item.quantity || 1)
      }
    }

    if (totalShippingFee === 0) {
      return {
        deliveryFee: 0,
        isFreeDelivery: true,
        totalPayable: subtotal,
        freeThreshold: 0,
        amountToFreeDelivery: 0,
      }
    }

    return {
      deliveryFee: totalShippingFee,
      isFreeDelivery: false,
      totalPayable: subtotal + totalShippingFee,
      freeThreshold: 0,
      amountToFreeDelivery: 0,
    }
  }, [cart, subtotal, activeStore?.products])

  const contextValue = useMemo<CartContextType>(
    () => ({
      cart,
      totalItems,
      subtotal,
      deliveryFee: deliveryPolicy.deliveryFee,
      isFreeDelivery: deliveryPolicy.isFreeDelivery,
      totalPayable: deliveryPolicy.totalPayable,
      freeThreshold: deliveryPolicy.freeThreshold,
      amountToFreeDelivery: deliveryPolicy.amountToFreeDelivery,
      isCartOpen,
      setIsCartOpen,
      openCart,
      closeCart,
      isCheckoutOpen,
      setIsCheckoutOpen,
      openCheckout,
      closeCheckout,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateCartItemVariant,
      clearCart,
      savedAddress,
      saveAddress,
      isBagAnimating,
      triggerBagAnimation,
    }),
    [
      cart,
      totalItems,
      subtotal,
      deliveryPolicy,
      isCartOpen,
      openCart,
      closeCart,
      isCheckoutOpen,
      openCheckout,
      closeCheckout,
      addToCart,
      removeFromCart,
      updateQuantity,
      updateCartItemVariant,
      clearCart,
      savedAddress,
      saveAddress,
      isBagAnimating,
      triggerBagAnimation,
    ]
  )

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
