'use client'

import React, { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  X,
  SlidersHorizontal,
  Sparkles,
  RotateCcw,
  Package,
} from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import { useStore } from '@/context/StoreContext'
import { Product } from '@/types/store'

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount'

function ProductCatalogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || 'All'

  const { activeStore, isLoading } = useStore()
  const products: Product[] = useMemo(() => activeStore.products || [], [activeStore.products])

  // Active category filter state
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory)
  // Local search query for fast in-page filtering
  const [searchQuery, setSearchQuery] = useState<string>('')
  // Sort state
  const [sortBy, setSortBy] = useState<SortOption>('featured')

  // Back button handler: returns user to exact storefront position where they left off
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/#new-arrivals')
    }
  }

  // Derive unique categories dynamically from both store categories and active products
  const categoryOptions = useMemo(() => {
    const list: { name: string; count: number }[] = []

    // Map of product counts per category
    const countMap = new Map<string, number>()
    for (const p of products) {
      const cat = p.category?.trim() || 'Uncategorized'
      countMap.set(cat, (countMap.get(cat) || 0) + 1)
    }

    // 1. Defined store categories
    const definedCategories = (activeStore.categories || [])
      .filter((c) => c.visible !== false)
      .map((c) => c.title)

    // 2. Additional product categories not in defined categories
    const extraCategories = Array.from(countMap.keys()).filter(
      (cat) => !definedCategories.some((d) => d.toLowerCase() === cat.toLowerCase())
    )

    const allCategories = Array.from(new Set([...definedCategories, ...extraCategories]))

    // Add 'All' first
    list.push({ name: 'All', count: products.length })

    for (const cat of allCategories) {
      // Count matching products
      const count = products.filter((p) => {
        const pCat = p.category?.toLowerCase() || ''
        const cLow = cat.toLowerCase()
        return pCat === cLow || pCat.includes(cLow) || cLow.includes(pCat)
      }).length

      list.push({ name: cat, count })
    }

    return list
  }, [products, activeStore.categories])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // 1. Category Filter
      if (selectedCategory !== 'All') {
        const pCat = p.category?.toLowerCase() || ''
        const targetCat = selectedCategory.toLowerCase()
        const matchesCategory =
          pCat === targetCat || pCat.includes(targetCat) || targetCat.includes(pCat)
        if (!matchesCategory) return false
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesSearch =
          p.name.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.gender?.toLowerCase().includes(q) ||
          p.badge?.toLowerCase().includes(q)
        if (!matchesSearch) return false
      }

      return true
    })

    // 3. Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      if (sortBy === 'discount') {
        const discA = a.originalPrice > a.price ? (a.originalPrice - a.price) / a.originalPrice : 0
        const discB = b.originalPrice > b.price ? (b.originalPrice - b.price) / b.originalPrice : 0
        return discB - discA
      }
      return 0 // 'featured' retains original order
    })

    return result
  }, [products, selectedCategory, searchQuery, sortBy])

  return (
    <div className="min-h-screen bg-[#faf8f4] py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation / Back Bar */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-white hover:bg-[#1a2e1a] text-[#1a2e1a] hover:text-white border border-[#e8d5b7] text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs group"
            title="Return to storefront where you left off"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Storefront</span>
          </button>

          {/* Breadcrumb Info */}
          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-xs text-[#7d7062]">
            <Link href="/" className="hover:text-[#1a2e1a] transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#1a2e1a]">Products Catalog</span>
          </nav>
        </div>

        {/* Page Title & Count Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8d5b7]/70 shadow-xs mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#1a2e1a] mb-1">
                VARNA STUDIO COLLECTION
              </p>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a1a]">
                {selectedCategory === 'All' ? 'All Products & Styles' : `${selectedCategory} Collection`}
              </h1>
              <p className="text-xs sm:text-sm text-[#7d7062] mt-1.5 max-w-xl">
                Browse our complete collection of custom-crafted apparel, everyday elevated fits, and studio drops.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1a2e1a]/8 text-[#1a2e1a] border border-[#1a2e1a]/15 text-xs font-bold shadow-2xs">
                <Package size={13} className="text-[#1a2e1a]" />
                <span>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'Style' : 'Styles'} Available
                </span>
              </span>
            </div>
          </div>

          {/* Search & Sort Toolbar */}
          <div className="mt-6 pt-5 border-t border-[#f0e7d8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a7d6e] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search styles, fabrics, cuts..."
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#faf8f4] border border-[#e8d5b7] text-xs sm:text-sm text-[#1a1a1a] placeholder:text-[#9e9080] focus:outline-none focus:border-[#1a2e1a] focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7d6e] hover:text-[#1a1a1a] cursor-pointer"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <label htmlFor="sort-select" className="text-xs font-semibold text-[#63574a] flex items-center gap-1.5 whitespace-nowrap">
                <SlidersHorizontal size={13} className="text-[#845d1d]" />
                <span>Sort by:</span>
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 rounded-xl bg-[#faf8f4] border border-[#e8d5b7] text-xs font-semibold text-[#1a1a1a] focus:outline-none focus:border-[#1a2e1a] cursor-pointer"
              >
                <option value="featured">Featured / Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Customer Rating</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Pills (Prominent & Horizontally Scrollable) */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#63574a]">
              Filter by Category
            </h2>
            {selectedCategory !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="text-[11px] font-semibold text-[#1a2e1a] hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw size={11} />
                <span>Reset to All</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {categoryOptions.map((cat) => {
              const isSelected = selectedCategory === cat.name
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#1a2e1a] text-white shadow-sm ring-2 ring-[#1a2e1a] ring-offset-1'
                      : 'bg-white text-[#63574a] border border-[#e8d5b7] hover:border-[#1a2e1a] hover:text-[#1a2e1a]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-[#faf8f4] text-[#8a7d6e]'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Search & Filter Indicators */}
        {(searchQuery.trim() || selectedCategory !== 'All') && (
          <div className="mb-6 bg-white p-3.5 rounded-2xl border border-[#e8d5b7] flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-[#1a1a1a] flex-wrap">
              <span className="text-[#845d1d] font-semibold">Active filters:</span>
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-[#1a2e1a]/10 text-[#1a2e1a] font-semibold px-2.5 py-1 rounded-full text-[11px]">
                  Category: {selectedCategory}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('All')}
                    className="hover:text-red-600 cursor-pointer ml-0.5"
                    aria-label="Remove category filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 bg-[#845d1d]/10 text-[#845d1d] font-semibold px-2.5 py-1 rounded-full text-[11px]">
                  Search: &ldquo;{searchQuery}&rdquo;
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="hover:text-red-600 cursor-pointer ml-0.5"
                    aria-label="Remove search filter"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All')
                setSearchQuery('')
              }}
              className="text-[11px] font-semibold text-[#7d7062] hover:text-[#1a1a1a] cursor-pointer whitespace-nowrap"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Content Area: Products Grid or Empty State */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-xs border border-[#e8d5b7]/50 animate-pulse flex flex-col h-72 sm:h-80"
              >
                <div className="aspect-[3/4] bg-[#f0ece4] w-full" />
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-3.5 bg-[#f0ece4] rounded-sm w-3/4" />
                    <div className="h-3 bg-[#f0ece4] rounded-sm w-1/2" />
                  </div>
                  <div className="h-3 bg-[#f0ece4] rounded-sm w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#e8d5b7]/70 p-8 sm:p-14 text-center max-w-lg mx-auto shadow-xs my-8">
            <div className="w-14 h-14 rounded-full bg-[#1a2e1a]/10 text-[#1a2e1a] flex items-center justify-center mx-auto mb-3.5">
              <Sparkles size={22} className="text-[#c4a675]" />
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-[#1a1a1a]">
              No styles found
            </h3>
            <p className="text-xs sm:text-sm text-[#7d7062] mt-2 max-w-sm mx-auto leading-relaxed">
              {searchQuery.trim()
                ? `We couldn't find any items matching "${searchQuery}". Try a different keyword or reset your filters.`
                : `No active products found in the "${selectedCategory}" category right now.`}
            </p>
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All')
                  setSearchQuery('')
                }}
                className="px-5 py-2.5 rounded-xl bg-[#1a2e1a] hover:bg-[#142414] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Reset &amp; View All Styles
              </button>
              <a
                href={`tel:${(activeStore.settings?.supportPhone || '+916363145972').replace(/[^0-9+]/g, '')}`}
                className="px-5 py-2.5 rounded-xl bg-white border border-[#ded7cb] text-[#1a2e1a] hover:bg-[#f0ece4] text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Call Studio Desk</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                fullWidth
                id={p.id}
                name={p.name}
                image={
                  p.colors?.[0]?.image ||
                  'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532655/varna_store/products/linen-shirt-terracotta.webp'
                }
                price={p.price}
                originalPrice={p.originalPrice}
                rating={p.rating}
                reviewCount={p.reviewCount}
                colors={p.colors}
                badge={p.badge}
                category={p.category}
                gender={p.gender}
                customization={p.customization}
                hasColorPricing={p.hasColorPricing}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductsCatalogClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf8f4] py-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-[#1a2e1a] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-[#7d7062] font-semibold">Loading Varna Catalog...</p>
          </div>
        </div>
      }
    >
      <ProductCatalogContent />
    </Suspense>
  )
}
