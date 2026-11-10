'use client'
import { Truck, RotateCcw, Scissors, ShieldCheck, Star } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { TrustBadgeItem } from '@/types/store'

const iconMap = {
  truck: Truck,
  rotate: RotateCcw,
  scissors: Scissors,
  shield: ShieldCheck,
}

const DEFAULT_BADGES: TrustBadgeItem[] = [
  {
    id: 'b1',
    title: 'Express Delivery Available',
    desc: 'Fast dispatch on all prepaid & COD orders',
    iconKey: 'truck',
  },
  {
    id: 'b2',
    title: 'Effortless Return & Exchange',
    desc: 'Doorstep size swaps with zero questions asked',
    iconKey: 'rotate',
  },
  {
    id: 'b3',
    title: 'Bespoke Custom Prints',
    desc: 'HD DTF wash-tested prints & Japanese embroidery',
    iconKey: 'scissors',
  },
  {
    id: 'b4',
    title: 'Pre-Washed Pure Fabrics',
    desc: 'Enzyme softened, guaranteed zero shrinkage or itchiness',
    iconKey: 'shield',
  },
]

export default function TrustBadges() {
  const { activeStore } = useStore()
  const badges = activeStore.homepage?.trustBadges?.length
    ? activeStore.homepage.trustBadges
    : DEFAULT_BADGES

  return (
    <section className="bg-white border-y border-[#e8d5b7]/50 py-3.5 md:py-5 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4">
        {/* On mobile (< md): continuous smooth auto-moving marquee */}
        <div className="md:hidden overflow-hidden relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white to-transparent z-10" />

          <div className="badges-marquee py-1">
            {[...badges, ...badges].map((b, idx) => {
              const Icon = iconMap[b.iconKey] || Star
              return (
                <div
                  key={`${b.id}-${idx}`}
                  className="flex items-center gap-2.5 flex-shrink-0 px-4"
                >
                  <div className="w-8 h-8 rounded-full bg-[#f0ece4] border border-[#e8d5b7]/40 flex items-center justify-center flex-shrink-0 text-[#1a2e1a]">
                    <Icon size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1a1a1a] whitespace-nowrap">
                      {b.title}
                    </p>
                    <p className="text-[10px] text-[#7d7062] whitespace-nowrap">
                      {b.desc}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* On desktop (md:): clean multi-column grid */}
        <div
          className={`hidden md:grid gap-6 py-1 ${
            badges.length === 4
              ? 'md:grid-cols-4'
              : badges.length === 5
              ? 'md:grid-cols-5'
              : 'md:grid-cols-3'
          }`}
        >
          {badges.map((b) => {
            const Icon = iconMap[b.iconKey] || Star
            return (
              <div key={b.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f0ece4] border border-[#e8d5b7]/40 flex items-center justify-center flex-shrink-0 text-[#1a2e1a]">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold text-[#1a1a1a]">{b.title}</p>
                  <p className="text-[11px] md:text-xs text-[#7d7062]">{b.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
