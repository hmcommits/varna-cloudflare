'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Star, Scissors, Eye } from 'lucide-react'
import { ProductColor, CustomizationConfig } from '@/types/store'

export interface ProductCardProps {
  id: string
  name: string
  image?: string
  price: number
  originalPrice: number
  rating: number
  reviewCount: number
  colors: (string | ProductColor)[]
  badge?: 'None' | 'New' | 'Trending' | 'Bestseller' | 'Flash Sale'
  category?: string
  gender?: string
  customization?: CustomizationConfig
  hasColorPricing?: boolean
  fullWidth?: boolean
  className?: string
}

const badgeStyles: Record<string, string> = {
  New: 'bg-[#1e4a36] text-[#faf8f4]',
  Trending: 'bg-[#c85a44] text-white',
  Bestseller: 'bg-[#c47d2b] text-white',
  'Flash Sale': 'bg-[#8b1e1e] text-white',
}

export default function ProductCard({
  id,
  name,
  image,
  price,
  originalPrice,
  rating,
  reviewCount,
  colors,
  badge,
  customization,
  hasColorPricing,
  fullWidth = false,
  className = '',
}: ProductCardProps) {
  const router = useRouter()

  const safeColors = Array.isArray(colors) ? colors : []

  // Determine the primary first uploaded image for default card thumbnail
  const firstUploadedImage =
    (typeof safeColors[0] === 'object' && safeColors[0]?.image) ||
    image ||
    'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532655/varna_store/products/linen-shirt-terracotta.webp'

  // Normalize and deduplicate colors, preserving the first uploaded image for each color
  const normalizedColorsMap = new Map<
    string,
    { hex: string; image?: string; name?: string; price?: number; originalPrice?: number }
  >()
  for (const c of safeColors) {
    const hex = (typeof c === 'string' ? c : c?.hex) || ''
    const key = hex.toLowerCase().trim()
    if (!normalizedColorsMap.has(key)) {
      normalizedColorsMap.set(key, {
        hex,
        image: typeof c === 'string' ? undefined : c?.image,
        name: typeof c === 'string' ? c : c?.name,
        price: typeof c === 'string' ? undefined : c?.price,
        originalPrice: typeof c === 'string' ? undefined : c?.originalPrice,
      })
    }
  }
  const normalizedColors = Array.from(normalizedColorsMap.values())

  const [selectedColorIdx, setSelectedColorIdx] = useState<number | null>(null)

  // Current active shown color: user-selected color if clicked, otherwise strictly the first color (index 0)
  const activeColor =
    (selectedColorIdx !== null ? normalizedColors[selectedColorIdx] : normalizedColors[0]) || null
  const displayImage = activeColor?.image || firstUploadedImage

  const isColorPricing = Boolean(hasColorPricing)
  const firstColorWithPrice = normalizedColors.find((c) => c.price && c.price > 0)

  // Dynamically resolve price of the currently shown color
  const effectivePrice =
    isColorPricing && activeColor?.price && activeColor.price > 0
      ? activeColor.price
      : price && price > 0
      ? price
      : activeColor?.price && activeColor.price > 0
      ? activeColor.price
      : firstColorWithPrice?.price || 0

  const effectiveOriginalPrice =
    isColorPricing && activeColor?.originalPrice && activeColor.originalPrice > 0
      ? activeColor.originalPrice
      : originalPrice && originalPrice > 0
      ? originalPrice
      : activeColor?.originalPrice && activeColor.originalPrice > 0
      ? activeColor.originalPrice
      : firstColorWithPrice?.originalPrice || effectivePrice

  const discount =
    effectiveOriginalPrice > effectivePrice
      ? Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100)
      : 0

  // Prefetch product page route for instantaneous <50ms navigation on tap/click
  useEffect(() => {
    if (id) {
      try {
        router.prefetch(`/products/${id}`)
      } catch {
        // Safe prefetch
      }
    }
  }, [id, router])

  const handleCardClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (typeof window !== 'undefined') {
      window.location.href = `/products/${id}`
    } else {
      router.push(`/products/${id}`)
    }
  }

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => {
        try {
          router.prefetch(`/products/${id}`)
        } catch {}
      }}
      onTouchStart={() => {
        try {
          router.prefetch(`/products/${id}`)
        } catch {}
      }}
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-[#e8d5b7]/50 hover:border-[#1a2e1a] flex flex-col select-none cursor-pointer ${
        fullWidth ? 'w-full' : 'flex-shrink-0 w-44 sm:w-48 md:w-52'
      } ${className}`}
    >
      {/* Real HTML Anchor overlay for SEO, middle-click / new-tab, and bulletproof native navigation */}
      <a
        href={`/products/${id}`}
        onClick={handleCardClick}
        aria-label={`View style ${name}`}
        className="absolute inset-0 z-0 cursor-pointer pointer-events-auto"
        tabIndex={-1}
      />

      {/* Product Image Frame */}
      <div className="relative aspect-[3/4] bg-[#f0ece4] overflow-hidden pointer-events-none">
        <Image
          src={displayImage}
          alt={name}
          fill
          sizes={
            fullWidth
              ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
              : '(max-width: 640px) 176px, 208px'
          }
          className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Status Badges top-left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {badge && badge !== 'None' && badgeStyles[badge] && (
            <span
              className={`text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full shadow-sm tracking-wide ${badgeStyles[badge]}`}
            >
              {badge}
            </span>
          )}

          {/* Customization Available Tag (As requested by user) */}
          {customization?.enabled && (
            <span className="inline-flex items-center gap-1 bg-[#1a2e1a]/95 text-[#f4efe6] text-[8.5px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-xs border border-[#c4a675]/40">
              <Scissors size={9} className="text-[#c4a675]" />
              <span>Custom Available</span>
            </span>
          )}
        </div>

        {/* Quick Action Hover Bar: View Style Details */}
        <div className="hidden sm:flex absolute inset-x-3 bottom-3 items-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10 pointer-events-auto">
          <button
            type="button"
            onClick={handleCardClick}
            className="w-full py-2 px-3 bg-[#1a2e1a] hover:bg-[#25D366] text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="View Details & Select Size"
          >
            <Eye size={13} className="text-[#e8d5b7]" />
            <span>View Style &amp; Sizes →</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white relative z-10 pointer-events-none">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <h3 className="text-xs sm:text-sm font-semibold text-[#1a1a1a] line-clamp-1 group-hover:text-[#1a2e1a] transition-colors flex items-center gap-1">
              <span>{name}</span>
            </h3>
            <span className="text-[10px] text-[#1a2e1a] font-bold group-hover:translate-x-0.5 transition-transform hidden sm:inline-block">
              →
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mb-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-[#1a1a1a]">
              ₹{effectivePrice.toLocaleString('en-IN')}
            </span>
            {effectiveOriginalPrice > effectivePrice && (
              <>
                <span className="text-[11px] text-[#8a7d6e] line-through">
                  ₹{effectiveOriginalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] font-bold text-[#c85a44]">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 mb-2">
            <Star size={11} className="fill-[#c47d2b] text-[#c47d2b] flex-shrink-0" />
            <span className="text-[10px] font-medium text-[#63574a]">
              {rating} <span className="text-[#9e9080]">({reviewCount})</span>
            </span>
          </div>
        </div>

        {/* Color Swatches (Clicking changes image live!) */}
        <div
          className="flex items-center justify-between pt-1 relative z-20 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5">
            {normalizedColors.map((c, idx) => {
              const isSelected = selectedColorIdx === null ? idx === 0 : selectedColorIdx === idx
              return (
                <button
                  key={c.hex + idx}
                  type="button"
                  onMouseEnter={() => setSelectedColorIdx(idx)}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedColorIdx(idx)
                  }}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-[#1a2e1a] ring-offset-1 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={`${c.name || c.hex}${c.price ? ` - ₹${c.price}` : ''}`}
                />
              )
            })}
          </div>

          <span className="text-[10px] text-[#8a7d6e] font-medium">
            {normalizedColors.length}{' '}
            {normalizedColors.length === 1 ? 'color' : 'colors'}
          </span>
        </div>

        {/* Mobile Action Button */}
        <div
          className="sm:hidden mt-2.5 relative z-20 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleCardClick}
            className="w-full py-2 px-3 bg-[#1a2e1a] text-white rounded-xl text-xs font-semibold active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center gap-1 shadow-xs"
          >
            <span>View Style &amp; Sizes</span>
            <span className="text-[#c4a675] font-bold">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
