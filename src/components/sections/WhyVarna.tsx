'use client'
import { Shield, Sparkles, Layers, Users } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { WhyVarnaItem } from '@/types/store'

const iconMap = {
  shield: Shield,
  sparkles: Sparkles,
  layers: Layers,
  users: Users,
}

const DEFAULT_REASONS: WhyVarnaItem[] = [
  { id: 'wv-1', iconKey: 'shield', title: 'Premium Quality', sub: 'Crafted for comfort' },
  { id: 'wv-2', iconKey: 'sparkles', title: 'Trendy Designs', sub: 'Styles for every occasion' },
  { id: 'wv-3', iconKey: 'layers', title: 'Custom Printing', sub: 'Tees, Jerseys & Hoodies' },
  { id: 'wv-4', iconKey: 'users', title: 'Loved by 1M+', sub: 'A growing community' },
]

export default function WhyVarna() {
  const { activeStore } = useStore()
  const title = activeStore.homepage?.whyVarnaTitle || 'Why Shop Varna?'
  const items = activeStore.homepage?.whyVarnaItems?.length
    ? activeStore.homepage.whyVarnaItems
    : DEFAULT_REASONS

  return (
    <section className="bg-white py-8 md:py-12 px-4 border-y border-[#e8d5b7]/50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-0">
        <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1a1a1a] md:w-56 flex-shrink-0 text-center md:text-left">
          {title}
        </h3>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:pl-10 w-full">
          {items.map((r) => {
            const IconComponent = (r.iconKey && iconMap[r.iconKey]) || Shield
            return (
              <div key={r.id || r.title} className="flex items-center gap-3">
                <div className="w-10 sm:w-11 h-10 sm:h-11 rounded-full border-2 border-[#1a2e1a]/25 bg-[#faf8f4] flex items-center justify-center flex-shrink-0 text-[#1a2e1a]">
                  <IconComponent size={18} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#1a1a1a]">{r.title}</p>
                  <p className="text-[11px] text-[#7d7062]">{r.sub}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
