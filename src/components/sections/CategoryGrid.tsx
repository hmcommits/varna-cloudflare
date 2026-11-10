'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useStore } from '@/context/StoreContext'

const DEFAULT_CATEGORIES = [
  { id: '1', title: 'Shirts', image: '/images/categories/shirts.webp', visible: true },
  { id: '2', title: 'Tops & Blouses', image: '/images/categories/tops-blouses.webp', visible: true },
  { id: '3', title: 'T-Shirts & Jerseys', image: '/images/categories/tshirts-jerseys.webp', visible: true },
  { id: '4', title: 'Dresses', image: '/images/categories/dresses.webp', visible: true },
  { id: '5', title: 'Jeans & Trousers', image: '/images/categories/jeans-trousers.webp', visible: true },
  { id: '6', title: 'Co-ord Sets', image: '/images/categories/coord-sets.webp', visible: true },
]

export default function CategoryGrid() {
  const { activeStore, selectCatalogFilter } = useStore()
  const rawCategories = activeStore.categories?.length
    ? activeStore.categories
    : DEFAULT_CATEGORIES

  const categories = rawCategories.filter((c) => c.visible !== false)

  const handleCategorySelect = (title: string) => {
    // Map composite names like "T-Shirts & Jerseys" -> "T-Shirts" or direct title
    let targetFilter = title
    if (title.includes('T-Shirt')) targetFilter = 'T-Shirts'
    else if (title.includes('Shirt')) targetFilter = 'Shirts'
    else if (title.includes('Jeans')) targetFilter = 'Jeans'
    else if (title.includes('Dress')) targetFilter = 'Dresses'
    else if (title.includes('Top')) targetFilter = 'Tops'
    else if (title.includes('Co-ord')) targetFilter = 'Co-ord Sets'

    selectCatalogFilter(targetFilter, true)
  }

  // Scroll into view if #collections hash is targeted
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.toLowerCase() === '#collections') {
      const timer = setTimeout(() => {
        const el = document.getElementById('collections')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 120)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <section id="collections" className="bg-[#faf8f4] py-10 md:py-16 px-4 scroll-mt-20">
      {/* Hidden SVG defs for Authentic Mughal pointed arch clip path */}
      <svg width="0" height="0" className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="mughal-arch-shape" clipPathUnits="objectBoundingBox">
            <path d="M 0.08,1 C 0.03,1 0,0.97 0,0.92 L 0,0.4 C 0,0.24 0.16,0.13 0.32,0.08 C 0.44,0.04 0.48,0.015 0.5,0 C 0.52,0.015 0.56,0.04 0.68,0.08 C 0.84,0.13 1,0.24 1,0.4 L 1,0.92 C 1,0.97 0.97,1 0.92,1 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <p className="text-[11px] md:text-xs font-bold tracking-[0.25em] uppercase text-[#1a2e1a] mb-1">
              SHOP BY CATEGORY
            </p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a1a]">
              Find Your Style
            </h2>
          </div>
          <button
            type="button"
            onClick={() => selectCatalogFilter('All', true)}
            className="text-xs sm:text-sm text-[#1a2e1a] font-semibold hover:underline flex items-center gap-1 group cursor-pointer"
          >
            View all categories{' '}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Authentic Mughal Arch-shaped Category Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id || cat.title}
              onClick={() => handleCategorySelect(cat.title)}
              className="group block cursor-pointer select-none"
            >
              {/* Mughal Arch Shaped Container */}
              <div className="relative overflow-hidden bg-[#e8d5b7] mughal-arch-clip aspect-[3/4] mb-2.5 shadow-sm group-hover:shadow-md transition-all duration-300">
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Delicate hairline Mughal arch border */}
                <svg
                  viewBox="0 0 100 133"
                  className="absolute inset-0 w-full h-full pointer-events-none text-[#e8d5b7]/70 group-hover:text-[#c4a675] transition-colors duration-300"
                  fill="none"
                >
                  <path
                    d="M 8,132 C 3,132 1,129 1,122 L 1,53 C 1,32 17,17.5 32,11 C 44,5.8 48,2.2 50,0.8 C 52,2.2 56,5.8 68,11 C 83,17.5 99,32 99,53 L 99,122 C 99,129 97,132 92,132 Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>

                {/* Bottom subtle gradient for contrast */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Action Arrow Button */}
                <div className="absolute bottom-2.5 right-2.5 w-7 h-7 bg-white/95 group-hover:bg-[#1a2e1a] text-[#1a2e1a] group-hover:text-white rounded-full flex items-center justify-center shadow-md opacity-90 sm:opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <ArrowRight size={13} />
                </div>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-center text-[#1a1a1a] group-hover:text-[#1a2e1a] transition-colors">
                {cat.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
