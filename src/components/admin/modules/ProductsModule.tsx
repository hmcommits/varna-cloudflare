'use client'
import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { HexColorPicker } from 'react-colorful'
import { useStore } from '@/context/StoreContext'
import { Product, ProductColor, CustomizationOption } from '@/types/store'
import {
  Plus,
  Trash2,
  Edit2,
  UploadCloud,
  Pipette,
  Check,
  Scissors,
  ArrowLeft,
  Star,
  Sparkles,
  Palette,
  X,
  Truck,
} from 'lucide-react'

interface ProductsModuleProps {
  initialCategoryFilter?: string | null
  openCreateOnMount?: boolean
}

const APPAREL_COLOR_PRESETS = [
  { name: 'Pure White', hex: '#FFFFFF', border: true },
  { name: 'Linen Cream', hex: '#F5F0E8', border: true },
  { name: 'Beige Khaki', hex: '#D4C5B9', border: false },
  { name: 'Terracotta', hex: '#B45309', border: false },
  { name: 'Olive Green', hex: '#4A6B53', border: false },
  { name: 'Forest Green', hex: '#1C3624', border: false },
  { name: 'Navy Blue', hex: '#1E3A8A', border: false },
  { name: 'Sky Blue', hex: '#60A5FA', border: false },
  { name: 'Charcoal Grey', hex: '#374151', border: false },
  { name: 'Jet Black', hex: '#111111', border: false },
  { name: 'Maroon Wine', hex: '#7F1D1D', border: false },
  { name: 'Mustard Sand', hex: '#CA8A04', border: false },
]

const DEFAULT_CATEGORIES = [
  'Shirts',
  'T-Shirts',
  'Dresses',
  'Jeans',
  'Tops',
  'Co-ord Sets',
]

const BADGES = ['None', 'New', 'Trending', 'Bestseller', 'Flash Sale'] as const

export default function ProductsModule({
  initialCategoryFilter,
  openCreateOnMount,
}: ProductsModuleProps) {
  const { draft, updateDraft, saveDraft, isSaving } = useStore()

  // Dynamically derive categories strictly from CategoriesModule (draft.categories)
  const categoriesList = Array.from(
    new Set(
      draft.categories && draft.categories.length > 0
        ? draft.categories.map((c) => c.title.trim()).filter(Boolean)
        : DEFAULT_CATEGORIES
    )
  )

  function createEmptyProduct(category?: string): Product {
    return {
      id: `prod-${Date.now()}`,
      name: '',
      category: category || '',
      gender: '',
      price: 0,
      originalPrice: 0,
      hasColorPricing: false,
      rating: 4.5,
      reviewCount: 10,
      stockUrgency: 'In Stock',
      badge: 'New',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: [],
      customization: {
        enabled: false,
        options: [],
      },
      features: {
        freeDelivery: true,
        customizationAvailable: false,
        returnable: true,
        qualityAssured: true,
      },
      description: '',
      fabricCare: '',
      shippingPolicy: '',
      chargeShipping: false,
      shippingCharges: 0,
    }
  }

  const [editingProduct, setEditingProduct] = useState<Product | null>(
    openCreateOnMount
      ? createEmptyProduct(initialCategoryFilter || '')
      : null
  )
  const [isCreating, setIsCreating] = useState(Boolean(openCreateOnMount))
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>(
    initialCategoryFilter || 'All'
  )

  // Uploading state
  const [uploading, setUploading] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Price input states
  const [sellingPriceInput, setSellingPriceInput] = useState<string>('')
  const [originalPriceInput, setOriginalPriceInput] = useState<string>('')

  // Sizes management
  const [allSizes, setAllSizes] = useState<string[]>([
    'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '28', '30', '32', '34', '36', '38'
  ])
  const [newSizeStart, setNewSizeStart] = useState('')
  const [newSizeEnd, setNewSizeEnd] = useState('')

  // Desktop Chromium EyeDropper API detection
  const [supportsEyeDropper, setSupportsEyeDropper] = useState(false)
  // Active card ID for custom desktop-style visual color picker
  const [activeColorPickerCardId, setActiveColorPickerCardId] = useState<string | null>(null)
  useEffect(() => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      if (!isMobile) {
        setSupportsEyeDropper(true)
      }
    }
  }, [])

  // Synchronize inputs when opening a product for edit
  useEffect(() => {
    if (editingProduct) {
      const fallbackPrice = editingProduct.price || editingProduct.colors[0]?.price || ''
      const fallbackOrigPrice = editingProduct.originalPrice || editingProduct.colors[0]?.originalPrice || ''
      setSellingPriceInput(fallbackPrice ? String(fallbackPrice) : '')
      setOriginalPriceInput(fallbackOrigPrice ? String(fallbackOrigPrice) : '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingProduct?.id])

  // Filter products for catalog list
  const products = draft.products || []
  const filteredProducts = products.filter((p) => {
    if (activeCategoryFilter === 'All') return true
    return p.category === activeCategoryFilter
  })

  // ----------------------------------------------------
  // MULTI-IMAGE UPLOAD ENGINE (Concurrent with 0ms local preview)
  // ----------------------------------------------------
  const handleProcessFiles = async (files: File[]) => {
    if (!files || files.length === 0 || !editingProduct) return

    setUploading(true)
    setUploadingCount(files.length)

    const adminToken =
      (typeof window !== 'undefined'
        ? sessionStorage.getItem('varna_admin_token')
        : null) ||
      draft.settings?.passcode ||
      'varna2026'

    // Instant local previews (0ms latency UI feedback)
    const tempVariants: Array<{
      tempId: string
      file: File
      variant: ProductColor
    }> = files.map((file, idx) => {
      const tempId = `temp-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`
      const localUrl = URL.createObjectURL(file)
      return {
        tempId,
        file,
        variant: {
          id: tempId,
          name: '', // Empty first, filled by admin or picked from existing colors
          hex: '',  // Empty first, chosen via picker or hex input
          image: localUrl,
          price: editingProduct.price || 0,
          originalPrice: editingProduct.originalPrice || 0,
        },
      }
    })

    // Immediately show new cards in editingProduct
    setEditingProduct((prev) => {
      if (!prev) return null
      return {
        ...prev,
        colors: [...prev.colors, ...tempVariants.map((t) => t.variant)],
      }
    })

    // Parallel cloud upload to Cloudinary
    const uploadTasks = tempVariants.map(async ({ tempId, file }) => {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          headers: { 'x-admin-token': adminToken },
          body: formData,
        })
        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        const permanentWebpUrl = data.url

        // Replace temporary object URL with Cloudinary WebP CDN URL
        setEditingProduct((prev) => {
          if (!prev) return null
          return {
            ...prev,
            colors: prev.colors.map((c) =>
              c.id === tempId
                ? {
                    ...c,
                    id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                    image: permanentWebpUrl,
                  }
                : c
            ),
          }
        })
      } catch (err) {
        console.error('Failed to upload image:', file.name, err)
        // Clean up failed card
        setEditingProduct((prev) => {
          if (!prev) return null
          return {
            ...prev,
            colors: prev.colors.filter((c) => c.id !== tempId),
          }
        })
        alert(`Failed to upload "${file.name}". Please try again.`)
      } finally {
        setUploadingCount((prev) => Math.max(0, prev - 1))
      }
    })

    await Promise.allSettled(uploadTasks)
    setUploading(false)
    setUploadingCount(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(Array.from(e.target.files))
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(Array.from(e.dataTransfer.files))
    }
  }

  // 1-Click Set as Primary Cover Thumbnail
  const handleSetAsCover = (index: number) => {
    if (index === 0) return
    setEditingProduct((prev) => {
      if (!prev) return prev
      const updated = [...prev.colors]
      const [selected] = updated.splice(index, 1)
      updated.unshift(selected)
      return {
        ...prev,
        colors: updated,
      }
    })
  }

  // Remove photo variant
  const handleRemovePhoto = (colorId: string) => {
    setEditingProduct((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        colors: prev.colors.filter((c) => c.id !== colorId),
      }
    })
  }

  // Update multiple color variant fields atomically
  const handleUpdateColorFields = (
    colorId: string,
    updates: Partial<ProductColor>
  ) => {
    setEditingProduct((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        colors: prev.colors.map((c) =>
          c.id === colorId ? { ...c, ...updates } : c
        ),
      }
    })
  }

  // Update a single color variant field (name, hex, price, originalPrice)
  const handleUpdateColorField = (
    colorId: string,
    field: keyof ProductColor,
    value: any
  ) => {
    handleUpdateColorFields(colorId, { [field]: value })
  }

  // Native desktop EyeDropper
  const handlePickColorForCard = async (colorId: string) => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper()
        const result = await eyeDropper.open()
        if (result?.sRGBHex) {
          handleUpdateColorField(colorId, 'hex', result.sRGBHex)
        }
      } catch {
        // User canceled
      }
    }
  }

  // Discard / Return to Catalog
  const handleCancelOrBack = () => {
    if (editingProduct) {
      const hasContent = editingProduct.name.trim() || editingProduct.colors.length > 0
      if (hasContent) {
        if (!confirm('Discard unsaved product changes and return to the catalog?')) {
          return
        }
      }
    }
    setEditingProduct(null)
    setIsCreating(false)
  }

  // Sizes management
  const handleAddSizeAtStart = () => {
    const trimmed = newSizeStart.trim().toUpperCase()
    if (!trimmed) return
    if (!allSizes.includes(trimmed)) {
      setAllSizes([trimmed, ...allSizes])
    }
    if (editingProduct && !editingProduct.sizes.includes(trimmed)) {
      setEditingProduct({
        ...editingProduct,
        sizes: [trimmed, ...editingProduct.sizes],
      })
    }
    setNewSizeStart('')
  }

  const handleAddSizeAtEnd = () => {
    const trimmed = newSizeEnd.trim().toUpperCase()
    if (!trimmed) return
    if (!allSizes.includes(trimmed)) {
      setAllSizes([...allSizes, trimmed])
    }
    if (editingProduct && !editingProduct.sizes.includes(trimmed)) {
      setEditingProduct({
        ...editingProduct,
        sizes: [...editingProduct.sizes, trimmed],
      })
    }
    setNewSizeEnd('')
  }

  // Customization management
  const handleAddCustomization = () => {
    if (!editingProduct) return
    const newOption: CustomizationOption = {
      id: `cust-${Date.now()}`,
      type: '',
      price: 0,
    }
    setEditingProduct({
      ...editingProduct,
      customization: {
        ...editingProduct.customization,
        options: [...editingProduct.customization.options, newOption],
      },
    })
  }

  const handleRemoveCustomization = (optionId: string) => {
    if (!editingProduct) return
    setEditingProduct({
      ...editingProduct,
      customization: {
        ...editingProduct.customization,
        options: editingProduct.customization.options.filter((o) => o.id !== optionId),
      },
    })
  }

  // Save product to StoreContext & MongoDB Atlas
  const handleSaveProductForm = async () => {
    if (!editingProduct) return

    if (!editingProduct.name.trim()) {
      alert('Please enter a product title.')
      return
    }

    if (!editingProduct.category || !editingProduct.category.trim()) {
      alert('Please select a category.')
      return
    }

    if (!editingProduct.gender || !editingProduct.gender.trim()) {
      alert('Please select a gender target (Men, Women, or Unisex).')
      return
    }

    if (editingProduct.colors.length === 0) {
      alert('Please upload at least one photo for this product.')
      return
    }

    const unconfigured = editingProduct.colors.find(
      (c) => !c.name.trim() || !c.hex.trim()
    )
    if (unconfigured) {
      alert('Please enter a color name and select a color swatch for each uploaded photo.')
      return
    }

    if (editingProduct.hasColorPricing) {
      const missingPriceColor = editingProduct.colors.find((c) => !c.price || c.price <= 0)
      if (missingPriceColor) {
        alert(`Please enter a valid selling price for the color "${missingPriceColor.name}".`)
        return
      }
      // Ensure product level fallback price is never left at 0
      const validPrices = editingProduct.colors.map((c) => c.price || 0).filter((p) => p > 0)
      if (validPrices.length > 0 && (!editingProduct.price || editingProduct.price === 0)) {
        editingProduct.price = validPrices[0]
      }
      const validOrig = editingProduct.colors.map((c) => c.originalPrice || 0).filter((p) => p > 0)
      if (validOrig.length > 0 && (!editingProduct.originalPrice || editingProduct.originalPrice === 0)) {
        editingProduct.originalPrice = validOrig[0]
      }
    } else {
      if (!editingProduct.price || editingProduct.price <= 0) {
        if (editingProduct.colors[0]?.price) {
          editingProduct.price = editingProduct.colors[0].price
        } else {
          alert('Please enter a selling price.')
          return
        }
      }
      if (!editingProduct.originalPrice || editingProduct.originalPrice <= 0) {
        editingProduct.originalPrice = editingProduct.price
      }
    }

    const existing = draft.products || []
    const index = existing.findIndex((p) => p.id === editingProduct.id)

    let nextProducts: Product[]
    if (index >= 0) {
      nextProducts = [...existing]
      nextProducts[index] = editingProduct
    } else {
      nextProducts = [editingProduct, ...existing]
    }

    const nextDraft = {
      ...draft,
      products: nextProducts,
    }

    updateDraft(() => nextDraft)
    setEditingProduct(null)
    setIsCreating(false)

    // Instantly commit to MongoDB Atlas and Vercel cloud
    const saved = await saveDraft(nextDraft)
    if (!saved) {
      alert('Product saved to draft. Please click "Save Changes" at the top to sync to the cloud.')
    }
  }

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const nextProducts = (draft.products || []).filter((p) => p.id !== id)
      const nextDraft = {
        ...draft,
        products: nextProducts,
      }
      updateDraft(() => nextDraft)
      await saveDraft(nextDraft)
    }
  }

  // =========================================================================
  // VIEW 1: DEDICATED FULL-SCREEN PRODUCT STUDIO (Option B Layout)
  // =========================================================================
  if (editingProduct) {
    const sPrice = parseInt(sellingPriceInput, 10) || 0
    const oPrice = parseInt(originalPriceInput, 10) || 0
    const savingsAmount = oPrice > sPrice ? oPrice - sPrice : 0
    const savingsPercent = oPrice > sPrice && oPrice > 0 ? Math.round((savingsAmount / oPrice) * 100) : 0

    return (
      <div className="space-y-6 pb-28 animate-in fade-in duration-200">
        {/* Top Studio Action Bar */}
        <div className="bg-white border border-[#ebe5da] rounded-3xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-4 z-20 backdrop-blur-md bg-white/95">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCancelOrBack}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#faf8f5] hover:bg-[#f0ece4] border border-[#ded7cb] text-xs font-bold text-[#142319] transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={15} />
              <span>Catalog</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#845d1d] font-mono">
                  {isCreating ? 'CREATE PRODUCT DROP' : 'EDIT PRODUCT STUDIO'}
                </span>
                {editingProduct.badge && editingProduct.badge !== 'None' && (
                  <span className="text-[9px] font-bold bg-[#eaf6ec] text-[#246b38] px-2 py-0.5 rounded-full border border-[#cbe8d1]">
                    {editingProduct.badge}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-xl font-bold text-[#142319] truncate max-w-xs sm:max-w-md">
                {editingProduct.name.trim() || 'Untitled Product Drop'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleCancelOrBack}
              className="px-4 py-2 rounded-xl bg-[#faf6f0] hover:bg-[#f0ece4] border border-[#ded7cb] text-xs font-semibold text-[#556358] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveProductForm}
              disabled={isSaving || uploading}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-xs shadow-xs transition-all active:scale-97 cursor-pointer disabled:opacity-50"
            >
              <Check size={14} />
              <span>{isSaving ? 'Saving to Cloud...' : 'Save Product Drop'}</span>
            </button>
          </div>
        </div>

        {/* Studio Content Container */}
        <div className="max-w-5xl mx-auto space-y-6">
          {/* SECTION 1: BASIC PRODUCT IDENTITY */}
          <div className="bg-white border border-[#ebe5da] rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
            <div className="border-b border-[#ebe5da] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#845d1d] font-mono block">
                STEP 1: IDENTITY
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#142319]">
                Product Title &amp; Category
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#142319] mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  placeholder="e.g., Premium Pure Linen Casual Shirt"
                  className="w-full bg-[#faf8f5] focus:bg-white border border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] rounded-xl px-3.5 py-2.5 text-xs text-[#142319] outline-hidden placeholder-[#8c978f] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142319] mb-1">
                  Category *
                </label>
                <select
                  value={editingProduct.category || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, category: e.target.value })
                  }
                  className={`w-full bg-[#faf8f5] focus:bg-white border rounded-xl px-3 py-2.5 text-xs outline-hidden cursor-pointer transition-all ${
                    !editingProduct.category
                      ? 'border-[#ded7cb] text-[#8c978f]'
                      : 'border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] text-[#142319]'
                  }`}
                >
                  <option value="" disabled>
                    -- Select Category --
                  </option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat} className="text-[#142319]">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142319] mb-1">
                  Gender Target *
                </label>
                <select
                  value={editingProduct.gender || ''}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      gender: e.target.value as 'Men' | 'Women' | 'Unisex' | '',
                    })
                  }
                  className={`w-full bg-[#faf8f5] focus:bg-white border rounded-xl px-3 py-2.5 text-xs outline-hidden cursor-pointer transition-all ${
                    !editingProduct.gender
                      ? 'border-[#ded7cb] text-[#8c978f]'
                      : 'border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] text-[#142319]'
                  }`}
                >
                  <option value="" disabled>
                    -- Select Gender Target --
                  </option>
                  <option value="Men" className="text-[#142319]">
                    Men
                  </option>
                  <option value="Women" className="text-[#142319]">
                    Women
                  </option>
                  <option value="Unisex" className="text-[#142319]">
                    Unisex
                  </option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#142319] mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  placeholder="Describe the silhouette, fabric weave, styling notes, or embroidery details..."
                  className="w-full bg-[#faf8f5] focus:bg-white border border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] rounded-xl p-3 text-xs text-[#142319] outline-hidden placeholder-[#8c978f] leading-relaxed transition-all"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PRICING & COLOR PRICING TOGGLE */}
          <div className="bg-white border border-[#ebe5da] rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
            <div className="border-b border-[#ebe5da] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#845d1d] font-mono block">
                STEP 2: PRICING
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#142319]">
                Product Pricing &amp; Color-Wise Rates
              </h3>
            </div>

            {/* Toggle: Different price for each color? */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#faf8f5] border border-[#ded7cb]">
              <div className="space-y-0.5 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#142319]">
                    Different price for each color?
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      editingProduct.hasColorPricing
                        ? 'bg-[#eef7f0] text-[#1c3624] border-[#b8e0bf]'
                        : 'bg-[#faf6f0] text-[#6b7770] border-[#ded7cb]'
                    }`}
                  >
                    {editingProduct.hasColorPricing
                      ? 'Color-Wise Rates Active'
                      : 'Off (Same Price for All Colors)'}
                  </span>
                </div>
                <p className="text-[11px] text-[#6b7770]">
                  {editingProduct.hasColorPricing
                    ? 'Individual prices will be specified directly on each photo card in the gallery below.'
                    : 'All colors share the standard base price entered here.'}
                </p>
              </div>

              {/* iOS-Style tactile toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(editingProduct.hasColorPricing)}
                onClick={() => {
                  const next = !editingProduct.hasColorPricing
                  setEditingProduct({
                    ...editingProduct,
                    hasColorPricing: next,
                    colors: editingProduct.colors.map((c) => ({
                      ...c,
                      price: c.price || editingProduct.price || 0,
                      originalPrice: c.originalPrice || editingProduct.originalPrice || 0,
                    })),
                  })
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  editingProduct.hasColorPricing ? 'bg-[#1c3624]' : 'bg-[#ded7cb]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    editingProduct.hasColorPricing ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Base Pricing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Selling Price */}
              <div className="bg-[#eef7f0] p-4 rounded-2xl border border-[#b8e0bf]">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#1e4a36]">
                    {editingProduct.hasColorPricing
                      ? 'Base / Starting Price (₹) *'
                      : 'Selling Price (₹) *'}
                  </label>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-[#d7eedc] text-[#1e4a36] px-2 py-0.5 rounded-full border border-[#b8e0bf]">
                    {editingProduct.hasColorPricing ? 'Catalog Fallback' : 'Customer Pays'}
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={sellingPriceInput}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '')
                    setSellingPriceInput(clean)
                    setEditingProduct({
                      ...editingProduct,
                      price: clean === '' ? 0 : parseInt(clean, 10),
                    })
                  }}
                  placeholder="e.g. 1199"
                  className="w-full bg-white border-2 border-[#206035] focus:border-[#14281a] focus:ring-1 focus:ring-[#14281a] rounded-xl px-3 py-2 text-sm font-bold text-[#142319] outline-hidden"
                />
              </div>

              {/* Original MRP */}
              <div className="bg-[#fdf2f0] p-4 rounded-2xl border border-[#f8cfca]">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#8b1e1e]">
                    {editingProduct.hasColorPricing
                      ? 'Base Original MRP (₹) *'
                      : 'Original MRP (₹) *'}
                  </label>
                  <span className="text-[9px] font-medium uppercase tracking-wider bg-[#fadcd7] text-[#8b1e1e] px-2 py-0.5 rounded-full border border-[#f8cfca]">
                    Display Strike-through
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={originalPriceInput}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '')
                    setOriginalPriceInput(clean)
                    setEditingProduct({
                      ...editingProduct,
                      originalPrice: clean === '' ? 0 : parseInt(clean, 10),
                    })
                  }}
                  placeholder="e.g. 2400"
                  className="w-full bg-white border border-[#c85a44] focus:border-[#8b1e1e] focus:ring-1 focus:ring-[#8b1e1e] rounded-xl px-3 py-2 text-sm text-[#55231c] outline-hidden"
                />
              </div>
            </div>

            {/* Savings Banner */}
            {savingsAmount > 0 && (
              <div className="p-3 bg-[#faf6f0] border border-[#f3e5c8] rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-[#845d1d] flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>Customer Saves: ₹{savingsAmount.toLocaleString('en-IN')} ({savingsPercent}% OFF)</span>
                </span>
                <span className="text-[11px] text-[#6b7770]">
                  ₹{sPrice} charged • ₹{oPrice} shown crossed out
                </span>
              </div>
            )}
          </div>

          {/* SECTION 3: MEDIA & COLOR GALLERY (MULTI-IMAGE BULK UPLOAD) */}
          <div className="bg-white border border-[#ebe5da] rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#ebe5da] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#845d1d] font-mono block">
                  STEP 3: MEDIA &amp; COLORS
                </span>
                <h3 className="text-sm sm:text-base font-bold text-[#142319] flex items-center gap-2">
                  <span>Product Photos &amp; Color Variants</span>
                  <span className="text-xs font-normal text-[#6b7770]">
                    ({editingProduct.colors.length} {editingProduct.colors.length === 1 ? 'photo' : 'photos'})
                  </span>
                </h3>
              </div>

              {uploading && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#845d1d] bg-[#fdf8ee] px-3 py-1 rounded-full border border-[#f3e5c8] animate-pulse">
                  <div className="w-3 h-3 border-2 border-[#845d1d] border-t-transparent rounded-full animate-spin" />
                  <span>Uploading {uploadingCount} photo{uploadingCount === 1 ? '' : 's'} to Cloudinary...</span>
                </span>
              )}
            </div>

            <p className="text-xs text-[#6b7770]">
              Select multiple photos at once. The first photo is automatically used as the <strong>Cover Photo / Catalog Thumbnail</strong>.
            </p>

            {/* Hidden Multi-file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              disabled={uploading}
              className="hidden"
            />

            {/* Drag & Drop Canvas / Tap to Select */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#1c3624] bg-[#eef7f0] scale-[1.01]'
                  : 'border-[#ded7cb] bg-[#faf8f5] hover:border-[#1c3624] hover:bg-[#faf6f0]'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#ded7cb] text-[#1c3624] flex items-center justify-center shadow-xs">
                  <UploadCloud size={24} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-[#142319]">
                    Click to browse or drop multiple photos here
                  </p>
                  <p className="text-[11px] text-[#6b7770]">
                    Select 1 to 10+ photos at once (JPG, PNG, WEBP, HEIC)
                  </p>
                </div>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1c3624] text-white font-bold text-xs shadow-xs pointer-events-none"
                >
                  <Plus size={14} />
                  <span>Choose Multiple Photos</span>
                </button>
              </div>
            </div>

            {/* Interactive Photo Cards Grid */}
            {editingProduct.colors.length > 0 && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b7770]">
                    Configured Photos &amp; Swatches ({editingProduct.colors.length})
                  </span>
                  <span className="text-[10px] text-[#246b38] font-semibold bg-[#eaf6ec] px-2 py-0.5 rounded-full border border-[#cbe8d1]">
                    ★ Card 1 is Cover / Storefront Thumbnail
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {(() => {
                    // Collect all unique colors configured with a name and hex so other cards can reuse them with 1 tap
                    const definedColors = Array.from(
                      new Map(
                        editingProduct.colors
                          .filter((c) => c.name.trim() && c.hex.trim())
                          .map((c) => [
                            c.name.trim().toLowerCase(),
                            {
                              name: c.name.trim(),
                              hex: c.hex.trim(),
                              price: c.price,
                              originalPrice: c.originalPrice,
                            },
                          ])
                      ).values()
                    )

                    return editingProduct.colors.map((color, idx) => {
                      const isCover = idx === 0
                      return (
                        <div
                          key={color.id}
                          className={`bg-white border rounded-2xl p-3.5 space-y-3 transition-all relative ${
                            isCover
                              ? 'border-[#1c3624] ring-2 ring-[#1c3624]/20 shadow-xs'
                              : 'border-[#ded7cb] hover:border-[#1c3624]'
                          }`}
                        >
                          {/* Top Card Bar: Cover Badge & Delete Button */}
                          <div className="flex items-center justify-between">
                            {isCover ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#1c3624] text-white px-2 py-0.5 rounded-full shadow-2xs">
                                <Star size={11} className="fill-white" />
                                <span>Cover Photo</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetAsCover(idx)}
                                className="text-[10px] font-bold text-[#556358] hover:text-[#1c3624] bg-[#faf6f0] hover:bg-[#eef7f0] border border-[#ded7cb] px-2 py-0.5 rounded-full transition-all cursor-pointer"
                                title="Set as Cover Photo / Catalog Thumbnail"
                              >
                                ★ Make Cover
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(color.id)}
                              className="text-[#8c978f] hover:text-[#b84840] p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove Photo"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {/* Photo Thumbnail */}
                          <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#faf8f5] border border-[#ded7cb]">
                            <Image
                              src={color.image}
                              alt={color.name || 'Product photo'}
                              fill
                              className="object-cover object-top"
                              unoptimized
                            />
                          </div>

                          {/* Quick-Pick Existing Colors from this product (if any defined) */}
                          {definedColors.length > 0 && (
                            <div className="space-y-1 bg-[#faf8f5] p-2 rounded-xl border border-[#ebe5da]">
                              <span className="text-[9px] font-bold text-[#845d1d] uppercase tracking-wider block">
                                Or select existing color:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {definedColors.map((dc) => {
                                  const isCurrent =
                                    color.name.trim().toLowerCase() === dc.name.toLowerCase() &&
                                    color.hex.trim().toLowerCase() === dc.hex.toLowerCase()

                                  return (
                                    <button
                                      key={dc.name}
                                      type="button"
                                      onClick={() => {
                                        const updates: Partial<ProductColor> = {
                                          name: dc.name,
                                          hex: dc.hex,
                                        }
                                        if (editingProduct.hasColorPricing) {
                                          if (dc.price !== undefined) {
                                            updates.price = dc.price
                                          }
                                          if (dc.originalPrice !== undefined) {
                                            updates.originalPrice = dc.originalPrice
                                          }
                                        }
                                        handleUpdateColorFields(color.id, updates)
                                      }}
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                                        isCurrent
                                          ? 'bg-[#1c3624] text-white border-[#1c3624] shadow-xs'
                                          : 'bg-white hover:bg-[#faf6f0] text-[#556358] border-[#ded7cb] hover:border-[#1c3624]'
                                      }`}
                                      title={`Apply "${dc.name}" (${dc.hex}) to this photo`}
                                    >
                                      <span
                                        className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 shadow-inner"
                                        style={{ backgroundColor: dc.hex }}
                                      />
                                      <span className="truncate max-w-[90px]">{dc.name}</span>
                                      {isCurrent && <Check size={10} className="stroke-[3]" />}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}

                          {/* Color Name Input */}
                          <div>
                            <label className="block text-[10px] font-semibold text-[#6b7770] mb-0.5">
                              Color Variant Name
                            </label>
                            <input
                              type="text"
                              value={color.name}
                              onChange={(e) =>
                                handleUpdateColorField(color.id, 'name', e.target.value)
                              }
                              placeholder="e.g. White, Sage Green, Beige"
                              className="w-full bg-[#faf8f5] focus:bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2.5 py-1.5 text-xs text-[#142319] outline-hidden font-medium placeholder-[#8c978f]"
                            />
                          </div>

                          {/* Color Swatch & Hex */}
                          <div>
                            <label className="block text-[10px] font-semibold text-[#6b7770] mb-0.5">
                              Color Swatch &amp; Hex
                            </label>
                            <div className="flex items-center gap-2">
                              {/* Swatch Square Button -> Opens Visual Desktop-Style Color Picker */}
                              <button
                                type="button"
                                onClick={() => setActiveColorPickerCardId(color.id)}
                                className={`relative w-8 h-8 rounded-lg border shadow-2xs flex-shrink-0 cursor-pointer overflow-hidden transition-transform active:scale-95 flex items-center justify-center ${
                                  color.hex ? 'border-[#ded7cb]' : 'border-dashed border-[#b8b0a2] bg-[#f4efe8]'
                                }`}
                                style={{ backgroundColor: color.hex || 'transparent' }}
                                title={color.hex ? `Color: ${color.hex} (Click to open visual color picker)` : 'Click to pick color'}
                              >
                                {!color.hex && (
                                  <span className="text-[10px] text-[#8c978f] font-bold">+</span>
                                )}
                              </button>

                              {/* Hex Text Box */}
                              <input
                                type="text"
                                value={color.hex}
                                placeholder="#HEX"
                                onChange={(e) =>
                                  handleUpdateColorField(color.id, 'hex', e.target.value)
                                }
                                className="flex-1 bg-[#faf8f5] focus:bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2 py-1.5 text-xs text-[#142319] outline-hidden font-mono uppercase placeholder-[#8c978f]"
                              />

                              {/* Visual Palette Picker Button */}
                              <button
                                type="button"
                                onClick={() => setActiveColorPickerCardId(color.id)}
                                className="p-1.5 rounded-lg bg-[#faf6f0] hover:bg-[#f0ece4] border border-[#ded7cb] text-[#1c3624] transition-all cursor-pointer flex-shrink-0"
                                title="Open visual desktop-style color picker"
                              >
                                <Palette size={13} />
                              </button>

                              {/* Eyedropper on supported desktop browsers */}
                              {supportsEyeDropper && (
                                <button
                                  type="button"
                                  onClick={() => handlePickColorForCard(color.id)}
                                  className="p-1.5 rounded-lg bg-[#faf6f0] hover:bg-[#f0ece4] border border-[#ded7cb] text-[#845d1d] transition-all cursor-pointer flex-shrink-0"
                                  title="Pick exact color from image"
                                >
                                  <Pipette size={13} />
                                </button>
                              )}
                            </div>
                          </div>

                        {/* DYNAMIC COLOR-WISE PRICING INPUTS (WHEN TOGGLE IS ON) */}
                        {editingProduct.hasColorPricing && (
                          <div className="pt-2 border-t border-[#ebe5da] space-y-2 bg-[#f7faf8] -mx-3 -mb-3 p-3 rounded-b-2xl">
                            <span className="text-[10px] font-bold text-[#1e4a36] uppercase tracking-wider block">
                              Rate for this Color:
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] font-bold text-[#1e4a36]">
                                  Price (₹) *
                                </label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={color.price !== undefined ? String(color.price) : ''}
                                  onChange={(e) => {
                                    const clean = e.target.value.replace(/[^0-9]/g, '')
                                    handleUpdateColorField(
                                      color.id,
                                      'price',
                                      clean === '' ? 0 : parseInt(clean, 10)
                                    )
                                  }}
                                  placeholder="1199"
                                  className="w-full bg-white border border-[#b8e0bf] focus:border-[#1c3624] rounded-md px-2 py-1 text-xs font-bold text-[#142319] outline-hidden"
                                />
                              </div>

                              <div>
                                <label className="block text-[9px] font-semibold text-[#8b1e1e]">
                                  MRP (₹)
                                </label>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={
                                    color.originalPrice !== undefined
                                      ? String(color.originalPrice)
                                      : ''
                                  }
                                  onChange={(e) => {
                                    const clean = e.target.value.replace(/[^0-9]/g, '')
                                    handleUpdateColorField(
                                      color.id,
                                      'originalPrice',
                                      clean === '' ? 0 : parseInt(clean, 10)
                                    )
                                  }}
                                  placeholder="2400"
                                  className="w-full bg-white border border-[#f8cfca] focus:border-[#8b1e1e] rounded-md px-2 py-1 text-xs text-[#55231c] outline-hidden"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                })()}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: INVENTORY URGENCY & MERCHANDISING BADGES */}
          <div className="bg-white border border-[#ebe5da] rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
            <div className="border-b border-[#ebe5da] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#845d1d] font-mono block">
                STEP 4: MERCHANDISING
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#142319]">
                Stock Urgency &amp; Storefront Badges
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#142319] mb-1">
                  Stock Urgency Status
                </label>
                <select
                  value={editingProduct.stockUrgency || 'In Stock'}
                  onChange={(e) => {
                    setEditingProduct({
                      ...editingProduct,
                      stockUrgency: e.target.value as any,
                    })
                  }}
                  className="w-full bg-[#faf8f5] focus:bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-xl px-3 py-2.5 text-xs text-[#142319] outline-hidden cursor-pointer"
                >
                  <option value="In Stock">In Stock</option>
                  <option value="Few Pieces Left">Few Pieces Left</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142319] mb-1">
                  Merchandising Badge
                </label>
                <select
                  value={editingProduct.badge || 'None'}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      badge: e.target.value as any,
                    })
                  }
                  className="w-full bg-[#faf8f5] focus:bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-xl px-3 py-2.5 text-xs text-[#142319] outline-hidden cursor-pointer"
                >
                  {BADGES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 5: SIZES */}
          <div className="bg-white border border-[#ebe5da] rounded-3xl p-5 sm:p-7 shadow-2xs space-y-4">
            <div className="border-b border-[#ebe5da] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#845d1d] font-mono block">
                STEP 5: SIZES
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#142319]">
                Available Sizes
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Add Smaller Size at START */}
                <div className="flex items-center gap-1 bg-[#faf8f5] p-1 rounded-xl border border-dashed border-[#ded7cb]">
                  <input
                    type="text"
                    value={newSizeStart}
                    onChange={(e) => setNewSizeStart(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSizeAtStart()
                      }
                    }}
                    placeholder="+ Smaller (XXS)"
                    className="w-28 bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2 py-1 text-xs text-[#142319] outline-hidden placeholder-[#8c978f]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSizeAtStart}
                    className="px-2 py-1 rounded-lg bg-[#1c3624] hover:bg-[#14281a] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-0.5"
                    title="Add size to start"
                  >
                    <Plus size={12} />
                    <span>Add</span>
                  </button>
                </div>

                {/* Existing Size Pills */}
                {allSizes.map((size) => {
                  const hasSize = editingProduct.sizes.includes(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        const updatedSizes = hasSize
                          ? editingProduct.sizes.filter((s) => s !== size)
                          : [...editingProduct.sizes, size]
                        setEditingProduct({ ...editingProduct, sizes: updatedSizes })
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        hasSize
                          ? 'bg-[#1c3624] text-white shadow-2xs'
                          : 'bg-[#faf6f0] text-[#556358] border border-[#ded7cb] hover:border-[#1c3624]'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}

                {/* Add Larger Size at END */}
                <div className="flex items-center gap-1 bg-[#faf8f5] p-1 rounded-xl border border-dashed border-[#ded7cb]">
                  <input
                    type="text"
                    value={newSizeEnd}
                    onChange={(e) => setNewSizeEnd(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddSizeAtEnd()
                      }
                    }}
                    placeholder="+ Larger (4XL)"
                    className="w-28 bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2 py-1 text-xs text-[#142319] outline-hidden placeholder-[#8c978f]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSizeAtEnd}
                    className="px-2 py-1 rounded-lg bg-[#1c3624] hover:bg-[#14281a] text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-0.5"
                    title="Add size to end"
                  >
                    <Plus size={12} />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: CUSTOMIZATION & STOREFRONT GUARANTEES */}
          <div className="bg-white border border-[#ebe5da] rounded-3xl p-5 sm:p-7 shadow-2xs space-y-5">
            <div className="border-b border-[#ebe5da] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#845d1d] font-mono block">
                STEP 6: TAILORING &amp; TRUST
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#142319]">
                Customization Add-On &amp; Customer Guarantees
              </h3>
            </div>

            {/* Customization Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#faf8f5] border border-[#ded7cb]">
              <div className="space-y-0.5 pr-3">
                <div className="flex items-center gap-2">
                  <Scissors size={15} className="text-[#845d1d]" />
                  <span className="text-xs sm:text-sm font-bold text-[#142319]">
                    Enable Tailoring &amp; Customization?
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      editingProduct.customization?.enabled
                        ? 'bg-[#eef7f0] text-[#1c3624] border-[#b8e0bf]'
                        : 'bg-[#faf6f0] text-[#6b7770] border-[#ded7cb]'
                    }`}
                  >
                    {editingProduct.customization?.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="text-[11px] text-[#6b7770]">
                  Allow customers to request monogram embroidery, DTF prints, or custom styling.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={editingProduct.customization?.enabled}
                onClick={() => {
                  const nextEnabled = !editingProduct.customization?.enabled
                  setEditingProduct({
                    ...editingProduct,
                    customization: {
                      ...editingProduct.customization,
                      enabled: nextEnabled,
                    },
                    features: {
                      freeDelivery: editingProduct.features?.freeDelivery ?? true,
                      customizationAvailable: nextEnabled,
                      returnable: editingProduct.features?.returnable ?? true,
                      qualityAssured: editingProduct.features?.qualityAssured ?? true,
                    },
                  })
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  editingProduct.customization?.enabled ? 'bg-[#1c3624]' : 'bg-[#ded7cb]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    editingProduct.customization?.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Customization Options List (When enabled) */}
            {editingProduct.customization?.enabled && (
              <div className="space-y-3 bg-[#faf8f5] border border-[#ded7cb] rounded-2xl p-4">
                <span className="text-xs font-bold text-[#142319] uppercase tracking-wider block">
                  Customization Options
                </span>
                {editingProduct.customization.options.map((opt, idx) => (
                  <div
                    key={opt.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-white p-3 rounded-xl border border-[#ebe5da]"
                  >
                    <div className="flex-1">
                      <label className="block text-[10px] font-semibold text-[#6b7770] mb-0.5">
                        Type (e.g. Pocket Monogram, Back DTF Print)
                      </label>
                      <input
                        type="text"
                        value={opt.type}
                        onChange={(e) => {
                          const nextOpts = [...editingProduct.customization.options]
                          nextOpts[idx].type = e.target.value
                          setEditingProduct({
                            ...editingProduct,
                            customization: {
                              ...editingProduct.customization,
                              options: nextOpts,
                            },
                          })
                        }}
                        placeholder="e.g. Pocket Monogram Embroidery"
                        className="w-full bg-[#faf8f5] focus:bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2.5 py-1.5 text-xs text-[#142319] outline-hidden"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="w-24">
                        <label className="block text-[10px] font-semibold text-[#6b7770] mb-0.5">
                          Fee (₹)
                        </label>
                        <input
                          type="number"
                          value={opt.price === 0 ? '' : opt.price}
                          placeholder="0"
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10)
                            const nextOpts = [...editingProduct.customization.options]
                            nextOpts[idx].price = isNaN(val) ? 0 : Math.max(0, val)
                            setEditingProduct({
                              ...editingProduct,
                              customization: {
                                ...editingProduct.customization,
                                options: nextOpts,
                              },
                            })
                          }}
                          className="w-full bg-[#faf8f5] focus:bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2.5 py-1.5 text-xs text-[#142319] outline-hidden font-bold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomization(opt.id)}
                        className="p-2 text-[#b84840] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove Option"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddCustomization}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#206035] bg-white hover:bg-[#eef7f0] text-[#206035] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus size={15} />
                  <span>+ Add Customization Option</span>
                </button>
              </div>
            )}

            {/* Product Shipping Charges Section with Toggle Switch */}
            <div className="bg-[#faf8f5] border-2 border-[#ded7cb] rounded-3xl p-4 sm:p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#ded7cb]/70">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-8 h-8 rounded-xl bg-[#1c3624]/10 text-[#1c3624] flex items-center justify-center shrink-0">
                      <Truck size={18} className="text-[#1c3624]" />
                    </div>
                    <span className="text-sm sm:text-base font-extrabold text-[#142319]">
                      Charge Shipping for this Product?
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border shadow-2xs ${
                        editingProduct.chargeShipping
                          ? 'bg-[#fef6e7] text-[#975a16] border-[#fae4ba]'
                          : 'bg-[#eef7f0] text-[#1c3624] border-[#b8e0bf]'
                      }`}
                    >
                      {editingProduct.chargeShipping
                        ? `Paid Delivery (₹${editingProduct.shippingCharges || 0})`
                        : 'Free Delivery (₹0)'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6b7770] mt-1.5 pl-10">
                    {editingProduct.chargeShipping
                      ? 'Toggle is ON: Custom shipping charge is applied when this product is in the cart.'
                      : 'Toggle is OFF: 100% Free Pan-India delivery for this product.'}
                  </p>
                </div>

                {/* Big Prominent Toggle Switch */}
                <div className="self-end sm:self-center pl-10 sm:pl-0">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(editingProduct.chargeShipping)}
                    onClick={() => {
                      const nextCharged = !editingProduct.chargeShipping
                      setEditingProduct({
                        ...editingProduct,
                        chargeShipping: nextCharged,
                        shippingCharges: nextCharged ? (editingProduct.shippingCharges || 99) : 0,
                      })
                    }}
                    className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden shadow-xs ${
                      editingProduct.chargeShipping ? 'bg-[#1c3624]' : 'bg-[#ded7cb]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        editingProduct.chargeShipping ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Large, Visible, Mobile-Optimized Input Box when toggle is ON */}
              {editingProduct.chargeShipping && (
                <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-[#1c3624]/40 shadow-sm space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <label className="text-sm sm:text-base font-extrabold text-[#142319] block">
                        Enter Shipping Charges (₹) *
                      </label>
                      <span className="text-xs text-[#6b7770]">
                        Pan-India delivery charge applied to this product.
                      </span>
                    </div>
                    <span className="shrink-0 text-xs sm:text-sm font-mono font-extrabold text-[#1c3624] bg-[#eef7f0] px-3 py-1.5 rounded-xl border border-[#b8e0bf]">
                      ₹{editingProduct.shippingCharges || 0}
                    </span>
                  </div>

                  {/* Big Touch-Friendly Number Field */}
                  <div className="relative w-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl sm:text-2xl font-black text-[#1c3624] select-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="0"
                      step="1"
                      placeholder="e.g. 99"
                      value={editingProduct.shippingCharges === 0 ? '' : (editingProduct.shippingCharges ?? 99)}
                      onChange={(e) => {
                        const raw = e.target.value
                        const val = raw === '' ? 0 : Math.max(0, parseInt(raw) || 0)
                        setEditingProduct({
                          ...editingProduct,
                          shippingCharges: val,
                        })
                      }}
                      className="w-full pl-11 sm:pl-12 pr-4 py-3.5 sm:py-4 rounded-xl border-2 border-[#1c3624]/40 focus:border-[#1c3624] bg-[#faf8f5] focus:bg-white text-lg sm:text-xl font-black text-[#142319] focus:outline-none focus:ring-4 focus:ring-[#1c3624]/15 transition-all shadow-inner placeholder-[#8c978f]"
                    />
                  </div>

                  {/* Quick Select Preset Buttons */}
                  <div>
                    <span className="text-xs font-bold text-[#6b7770] uppercase tracking-wider block mb-2">
                      Quick Select (Tap to set):
                    </span>
                    <div className="grid grid-cols-4 gap-2 sm:gap-3">
                      {[49, 79, 99, 149].map((fee) => (
                        <button
                          key={fee}
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              shippingCharges: fee,
                            })
                          }
                          className={`py-2.5 sm:py-3 px-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer text-center active:scale-95 shadow-xs ${
                            editingProduct.shippingCharges === fee
                              ? 'bg-[#1c3624] text-white ring-2 ring-[#1c3624] ring-offset-2 shadow-sm'
                              : 'bg-white text-[#142319] border-2 border-[#ded7cb] hover:border-[#1c3624] hover:bg-[#faf8f5]'
                          }`}
                        >
                          ₹{fee}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Notice Preview */}
                  <div className="flex items-center gap-2 text-xs text-[#206035] bg-[#eef7f0] p-3 rounded-xl border border-[#b8e0bf]">
                    <Truck size={16} className="shrink-0 text-[#1c3624]" />
                    <span>
                      Customer will pay <strong>₹{editingProduct.shippingCharges || 0}</strong> shipping at checkout for this item.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Storefront Guarantees */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#142319] block">
                Storefront Assurances
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    key: 'freeDelivery',
                    label: 'Express Delivery Available',
                    sub: 'Displays "Express Delivery Available"',
                  },
                  {
                    key: 'customizationAvailable',
                    label: 'Customization Available',
                    sub: 'Displays "Customization Available" badge',
                  },
                  {
                    key: 'returnable',
                    label: 'Easy Return & Exchange',
                    sub: 'Displays "Easy Return & Exchange • Doorstep swap"',
                  },
                  {
                    key: 'qualityAssured',
                    label: '100% Quality Assured',
                    sub: 'Displays "100% Pure & Quality Assured Guarantee"',
                  },
                ].map((feat) => {
                  const isChecked =
                    editingProduct.features?.[feat.key as keyof typeof editingProduct.features] ??
                    (feat.key === 'customizationAvailable'
                      ? Boolean(editingProduct.customization?.enabled)
                      : true)

                  return (
                    <label
                      key={feat.key}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-[#f4f9f5] border-[#1c3624] text-[#142319]'
                          : 'bg-[#faf8f5] border-[#ded7cb] text-[#6b7770]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const nextVal = e.target.checked
                          setEditingProduct({
                            ...editingProduct,
                            features: {
                              freeDelivery: editingProduct.features?.freeDelivery ?? true,
                              customizationAvailable:
                                editingProduct.features?.customizationAvailable ??
                                Boolean(editingProduct.customization?.enabled),
                              returnable: editingProduct.features?.returnable ?? true,
                              qualityAssured: editingProduct.features?.qualityAssured ?? true,
                              [feat.key]: nextVal,
                            },
                          })
                        }}
                        className="mt-0.5 rounded text-[#1c3624] focus:ring-[#1c3624] w-4 h-4 cursor-pointer accent-[#1c3624]"
                      />
                      <div>
                        <span className="text-xs font-bold block">{feat.label}</span>
                        <span className="text-[10px] text-[#6b7770]">{feat.sub}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Mobile/Desktop Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#ded7cb] p-3 sm:px-8 flex items-center justify-between gap-3 shadow-lg">
          <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleCancelOrBack}
              className="py-2.5 px-4 rounded-xl bg-[#faf6f0] hover:bg-[#f0ece4] border border-[#ded7cb] text-xs font-semibold text-[#556358] transition-colors cursor-pointer"
            >
              Discard Changes
            </button>
            <button
              type="button"
              onClick={handleSaveProductForm}
              disabled={isSaving || uploading}
              className="py-2.5 px-6 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-xs shadow-xs transition-all active:scale-97 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>{isSaving ? 'Saving to Cloud...' : 'Save Product Drop'}</span>
            </button>
          </div>
        </div>

        {/* VISUAL DESKTOP-STYLE COLOR STUDIO MODAL / BOTTOM SHEET */}
        {activeColorPickerCardId && (() => {
          const targetColor = editingProduct.colors.find((c) => c.id === activeColorPickerCardId)
          if (!targetColor) return null

          const currentColorHex =
            targetColor.hex && targetColor.hex.startsWith('#')
              ? targetColor.hex
              : '#1C3624'

          return (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
              onClick={() => setActiveColorPickerCardId(null)}
            >
              <div
                className="bg-white rounded-3xl p-5 w-full max-w-sm border border-[#ebe5da] shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#ebe5da] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-lg border border-[#ded7cb] shadow-2xs shrink-0"
                      style={{ backgroundColor: targetColor.hex || 'transparent' }}
                    />
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#142319] leading-tight">
                        Color Variant Selector
                      </h3>
                      <p className="text-[10px] text-[#6b7770]">
                        {targetColor.name ? `Editing: ${targetColor.name}` : 'Desktop-style visual color picker'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveColorPickerCardId(null)}
                    className="p-1 rounded-lg text-[#8b948d] hover:text-[#142319] hover:bg-[#faf6f0] transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* 1. Desktop-Style 2D Visual Gradient Box + Rainbow Hue Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b7770]">
                      Visual Spectrum
                    </label>
                    <span className="text-[10px] text-[#845d1d] font-semibold">Touch &amp; Drag</span>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-2xs border border-[#ebe5da] p-1.5 bg-[#faf8f5]">
                    <HexColorPicker
                      color={currentColorHex}
                      onChange={(newHex) => {
                        handleUpdateColorField(targetColor.id, 'hex', newHex.toUpperCase())
                      }}
                      style={{ width: '100%', height: '175px' }}
                    />
                  </div>
                </div>

                {/* 2. Hex Code Input with Live Preview Swatch */}
                <div className="flex items-center gap-2 bg-[#faf8f5] border border-[#ded7cb] rounded-xl px-3 py-2">
                  <div
                    className="w-5 h-5 rounded-md border border-[#ded7cb] shadow-2xs shrink-0"
                    style={{ backgroundColor: targetColor.hex || '#1C3624' }}
                  />
                  <span className="text-xs font-mono font-bold text-[#845d1d]">HEX:</span>
                  <input
                    type="text"
                    value={targetColor.hex || ''}
                    onChange={(e) => {
                      let val = e.target.value.trim().toUpperCase()
                      if (val && !val.startsWith('#')) val = '#' + val
                      handleUpdateColorField(targetColor.id, 'hex', val)
                    }}
                    placeholder="#1C3624"
                    className="w-full bg-transparent text-xs font-mono font-bold text-[#142319] outline-hidden uppercase"
                  />
                </div>

                {/* 3. 1-Tap Popular Apparel Clothing Presets */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b7770]">
                    Popular Apparel Presets
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {APPAREL_COLOR_PRESETS.map((preset) => {
                      const isSelected = targetColor.hex?.toUpperCase() === preset.hex.toUpperCase()
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => {
                            handleUpdateColorFields(targetColor.id, {
                              hex: preset.hex,
                              ...(!targetColor.name?.trim() ||
                              APPAREL_COLOR_PRESETS.some(
                                (p) => p.name.toLowerCase() === targetColor.name.trim().toLowerCase()
                              )
                                ? { name: preset.name }
                                : {}),
                            })
                          }}
                          className={`flex items-center gap-1.5 p-1.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#1c3624] bg-[#f4f9f5] ring-2 ring-[#1c3624]/20 shadow-xs'
                              : 'border-[#ded7cb] bg-white hover:bg-[#faf6f0]'
                          }`}
                          title={preset.name}
                        >
                          <span
                            className="w-4 h-4 rounded-md border shrink-0"
                            style={{
                              backgroundColor: preset.hex,
                              borderColor: preset.border ? '#ded7cb' : preset.hex,
                            }}
                          />
                          <span className="text-[10px] font-medium text-[#142319] truncate leading-tight">
                            {preset.name.split(' ')[0]}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 4. Existing Colors in Current Product Drop */}
                {(() => {
                  const otherColors = editingProduct.colors.filter(
                    (c) => c.id !== targetColor.id && c.hex && c.hex.trim()
                  )
                  if (otherColors.length === 0) return null
                  return (
                    <div className="space-y-1.5 pt-2 border-t border-[#ebe5da]">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6b7770]">
                        Existing Colors in Drop
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {otherColors.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              handleUpdateColorFields(targetColor.id, {
                                hex: c.hex,
                                ...(!targetColor.name?.trim() && c.name?.trim() ? { name: c.name } : {}),
                              })
                            }}
                            className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-[#f4f9f5] hover:bg-[#eaf6ec] border border-[#cbe8d1] text-xs text-[#1c502b] font-medium cursor-pointer transition-all"
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="truncate max-w-[120px]">{c.name || c.hex}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* 5. Footer Done Button */}
                <div className="pt-2 border-t border-[#ebe5da] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleUpdateColorField(targetColor.id, 'hex', '')
                      setActiveColorPickerCardId(null)
                    }}
                    className="py-2 px-3 text-xs text-[#8c978f] hover:text-[#b84840] font-medium cursor-pointer"
                  >
                    Clear Swatch
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveColorPickerCardId(null)}
                    className="py-2 px-5 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97 flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Apply Color</span>
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    )
  }

  // =========================================================================
  // VIEW 2: ACTIVE CATALOG OVERVIEW & TABLE
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Module Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#ebe5da] rounded-3xl p-6 shadow-2xs">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#845d1d] font-mono">
            CATALOG &amp; INVENTORY STUDIO
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#142319] mt-0.5">
            Products &amp; Variants Management
          </h2>
          <p className="text-xs text-[#6b7770] mt-0.5">
            Multi-photo uploads, color-to-image mapping, rates &amp; customization add-ons
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setEditingProduct(createEmptyProduct())
              setIsCreating(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-xs shadow-xs transition-all active:scale-97 cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {['All', ...categoriesList].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategoryFilter === cat
                ? 'bg-[#1c3624] text-white shadow-2xs'
                : 'bg-white text-[#556358] border border-[#ded7cb] hover:border-[#1c3624] hover:text-[#142319]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Table Card */}
      <div className="bg-white border border-[#ebe5da] rounded-3xl shadow-2xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#6b7770] flex flex-col items-center justify-center">
            <p>No products found in category &ldquo;{activeCategoryFilter}&rdquo;.</p>
            <button
              type="button"
              onClick={() => {
                setEditingProduct(createEmptyProduct())
                setIsCreating(true)
              }}
              className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-xs shadow-xs transition-all active:scale-97 cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Product</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf7f2] text-[#4a4740] uppercase text-[10px] tracking-wider border-b border-[#ebe5da]">
                <tr>
                  <th className="py-3 px-4 font-bold">Product</th>
                  <th className="py-3 px-4 font-bold">Price</th>
                  <th className="py-3 px-4 font-bold">Shipping Charge</th>
                  <th className="py-3 px-4 font-bold">Badge</th>
                  <th className="py-3 px-4 font-bold">Colors &amp; Photos</th>
                  <th className="py-3 px-4 font-bold">Customization</th>
                  <th className="py-3 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebe5da] text-[#142319]">
                {filteredProducts.map((p) => {
                  // Thumbnail image and price corresponding to the shown thumbnail
                  const thumbnailColor = p.colors[0]
                  const effectivePrice =
                    p.hasColorPricing && thumbnailColor?.price
                      ? thumbnailColor.price
                      : p.price > 0
                      ? p.price
                      : thumbnailColor?.price || 0

                  const effectiveOriginalPrice =
                    p.hasColorPricing && thumbnailColor?.originalPrice
                      ? thumbnailColor.originalPrice
                      : p.originalPrice > 0
                      ? p.originalPrice
                      : thumbnailColor?.originalPrice || effectivePrice

                  const discount =
                    effectiveOriginalPrice > effectivePrice
                      ? Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100)
                      : 0

                  const primaryImage =
                    thumbnailColor?.image ||
                    'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532655/varna_store/products/linen-shirt-terracotta.webp'

                  // Deduplicate colors by hex to avoid duplicate swatch dots
                  const uniqueColors = Array.from(
                    new Map(p.colors.map((c) => [(c.hex || '').toLowerCase().trim(), c])).values()
                  )

                  return (
                    <tr
                      key={p.id}
                      onClick={() => {
                        setEditingProduct(p)
                        setIsCreating(false)
                      }}
                      className="hover:bg-[#faf6f0] transition-colors cursor-pointer group"
                      title="Click anywhere on product to edit"
                    >
                      {/* Product Name & Category */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-[#faf5ee] border border-[#e8ded3] flex-shrink-0">
                            <Image
                              src={primaryImage}
                              alt={p.name}
                              fill
                              className="object-cover object-top"
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-[#142319] block text-sm group-hover:text-[#1c3624] transition-colors">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className="text-[10px] text-[#6b7770]">
                                {p.category} • {p.gender} • {p.stockUrgency}
                              </span>
                              {p.chargeShipping && (Number(p.shippingCharges) || 0) > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-[#fef6e7] text-[#975a16] border border-[#fae4ba] px-1.5 py-0.2 rounded-md shadow-2xs">
                                  <Truck size={10} className="text-[#975a16]" />
                                  <span>₹{p.shippingCharges} Shipping</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-[#eef7f0] text-[#1c3624] border border-[#b8e0bf] px-1.5 py-0.2 rounded-md">
                                  <Truck size={10} className="text-[#1c3624]" />
                                  <span>Free Delivery</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="py-3 px-4">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="font-bold text-[#142319] text-sm">
                            ₹{effectivePrice.toLocaleString('en-IN')}
                          </span>
                          {effectiveOriginalPrice > effectivePrice && (
                            <span className="text-[11px] text-[#8c978f] line-through">
                              ₹{effectiveOriginalPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                          {discount > 0 && (
                            <span className="text-[10px] font-bold text-[#845d1d]">
                              {discount}% OFF
                            </span>
                          )}
                          {p.hasColorPricing && (
                            <span className="text-[9px] font-bold bg-[#eef7f0] text-[#1c3624] px-1.5 py-0.5 rounded-sm border border-[#b8e0bf]">
                              Color-Wise
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Shipping Charges Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {p.chargeShipping && (Number(p.shippingCharges) || 0) > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#fef6e7] text-[#975a16] border border-[#fae4ba] shadow-2xs">
                            <Truck size={12} className="text-[#975a16]" />
                            <span>₹{p.shippingCharges} Shipping</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#eef7f0] text-[#1c3624] border border-[#b8e0bf]">
                            <Truck size={12} className="text-[#1c3624]" />
                            <span>Free Delivery</span>
                          </span>
                        )}
                      </td>

                      {/* Badge */}
                      <td className="py-3 px-4">
                        {p.badge && p.badge !== 'None' ? (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.badge === 'New'
                                ? 'bg-[#eaf6ec] text-[#246b38] border border-[#cbe8d1]'
                                : p.badge === 'Trending'
                                ? 'bg-[#fdf0ef] text-[#b84840] border border-[#fcd8d5]'
                                : 'bg-[#fef6e7] text-[#975a16] border border-[#fae4ba]'
                            }`}
                          >
                            {p.badge}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#8c978f]">Standard</span>
                        )}
                      </td>

                      {/* Color Swatches (Accurately Deduplicated) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {uniqueColors.map((c) => (
                            <span
                              key={c.id || c.name}
                              className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: c.hex }}
                              title={`${c.name} (${c.hex})`}
                            />
                          ))}
                          <span className="text-[10px] text-[#6b7770] ml-1">
                            ({uniqueColors.length} color{uniqueColors.length === 1 ? '' : 's'}
                            {p.colors.length > uniqueColors.length
                              ? ` • ${p.colors.length} photos`
                              : ''})
                          </span>
                        </div>
                      </td>

                      {/* Customization Available Badge */}
                      <td className="py-3 px-4">
                        {p.customization?.enabled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-[#eaf6ec] text-[#246b38] border border-[#cbe8d1] px-2.5 py-0.5 rounded-full font-bold">
                            <Scissors size={10} />
                            <span>Customization Available</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#8c978f]">No</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingProduct(p)
                              setIsCreating(false)
                            }}
                            className="p-1.5 rounded-lg text-[#556358] hover:text-[#1c3624] hover:bg-[#faf6f0] transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteProduct(p.id, p.name)
                            }}
                            className="p-1.5 rounded-lg text-[#8c978f] hover:text-[#b84840] hover:bg-[#fdf0ef] transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
