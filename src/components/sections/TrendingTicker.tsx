'use client'
import { useStore } from '@/context/StoreContext'

const DEFAULT_ITEMS = [
  'Relaxed Shirts',
  'Oversized Tees',
  'Festive Kurtas',
  'Everyday Dresses',
  'Linen Collection',
  'Co-ord Sets',
  'Premium Denims',
  'Custom Hoodies',
]

export default function TrendingTicker() {
  const { activeStore } = useStore()
  const items = activeStore.homepage?.tickerChips?.length
    ? activeStore.homepage.tickerChips
    : DEFAULT_ITEMS

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
  }

  return (
    <div className="bg-[#f5efe6] border-y border-[#e8d5b7]/80 py-2.5 overflow-hidden select-none">
      <div className="flex items-center">
        <span className="font-semibold text-[11px] md:text-xs text-[#1a2e1a] tracking-wider uppercase px-4 whitespace-nowrap flex-shrink-0 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1a2e1a] animate-pulse" />
          Trending Now:
        </span>
        <div className="overflow-hidden flex-1 relative">
          <div className="ticker-animate whitespace-nowrap flex">
            {[...items, ...items, ...items].map((item, i) => (
              <span key={i} className="inline-flex items-center text-xs text-[#3d362e] mx-3 md:mx-4">
                <a
                  href="#trending"
                  onClick={handleClick}
                  className="hover:text-[#1a2e1a] font-medium transition-colors cursor-pointer"
                >
                  {item}
                </a>
                <span className="ml-3 md:ml-4 text-[#c4a675]">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
