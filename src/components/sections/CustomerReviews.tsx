'use client'
import { useRef } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote, CheckCircle2 } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { ReviewItem } from '@/types/store'

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'Arjun Menon',
    city: 'Bengaluru',
    rating: 5,
    title: 'Cloud-soft from day 1',
    comment:
      'Most linen shirts under 2k feel stiff and scratchy until washed 5 times. This one was supple and breathable right out of the box. Ordered Size L, fits spot on.',
    verified: true,
    date: 'Verified Buyer • 3 days ago',
  },
  {
    id: 'rev-2',
    name: 'Vikram Sengupta',
    city: 'Mumbai',
    rating: 5,
    title: 'Perfect for coastal heat',
    comment:
      'Wore the Desert Terracotta shade for a sundowner in Goa. Kept me cool through the evening humidity. Concierge on WhatsApp dispatched it within a day!',
    verified: true,
    date: 'Verified Buyer • 1 week ago',
  },
  {
    id: 'rev-3',
    name: 'Rohan Kapoor',
    city: 'Delhi',
    rating: 4,
    title: 'Custom monogram looks elite',
    comment:
      'Asked for my initials embroidered on the left cuff via WhatsApp. They sent a quick mockup preview before stitching. Premium feel throughout.',
    verified: true,
    date: 'Verified Buyer • 2 weeks ago',
  },
]

export default function CustomerReviews() {
  const { activeStore } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  const reviewConfig = activeStore.reviews || {
    averageRating: 4.6,
    totalReviewsCount: 120,
    items: DEFAULT_REVIEWS,
  }

  const reviews = reviewConfig.items?.length ? reviewConfig.items : DEFAULT_REVIEWS

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const clientWidth = scrollRef.current.clientWidth
    const scrollStep = clientWidth > 400 ? clientWidth * 0.8 : 280
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -scrollStep : scrollStep,
      behavior: 'smooth',
    })
  }

  return (
    <section className="bg-white py-10 md:py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Rating Summary */}
        <div className="md:col-span-4">
          <p className="text-[11px] md:text-xs font-bold tracking-[0.25em] uppercase text-[#1a2e1a] mb-1">
            TESTIMONIALS
          </p>
          <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-3">
            What our community says
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={18}
                  className={
                    s <= Math.round(reviewConfig.averageRating)
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <span className="text-base font-bold text-[#1a1a1a]">
              {reviewConfig.averageRating} / 5
            </span>
          </div>
          <p className="text-xs text-[#7d7062]">
            Based on {reviewConfig.totalReviewsCount}+ verified customer reviews across India.
          </p>
        </div>

        {/* Right - Interactive Review Cards Track with Working Arrows */}
        <div className="md:col-span-8 relative">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Previous review"
            className="absolute left-1 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-8 sm:w-10 h-8 sm:h-10 bg-white/95 hover:bg-white text-[#1a2e1a] rounded-full flex items-center justify-center shadow-lg border border-[#e8d5b7]/80 active:scale-90 transition-all cursor-pointer"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Cards Track */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
          >
            {reviews.map((r) => (
              <div
                key={r.id}
                className="flex-shrink-0 w-72 sm:w-80 bg-[#faf8f4] rounded-2xl p-5 sm:p-6 border border-[#e8d5b7]/60 hover:border-[#c4a675] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Quote size={24} className="text-[#1a2e1a]/25" />
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={10} />
                        <span>Verified Buyer</span>
                      </span>
                    )}
                  </div>
                  {r.title && (
                    <h4 className="font-display font-bold text-sm text-[#1a1a1a] mb-1.5">
                      &quot;{r.title}&quot;
                    </h4>
                  )}
                  <p className="text-xs sm:text-sm text-[#3d362e] leading-relaxed mb-4 italic">
                    &quot;{r.comment}&quot;
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#e8d5b7]/40">
                  <span className="text-xs sm:text-sm font-bold text-[#1a1a1a]">
                    — {r.name}{r.city ? `, ${r.city}` : ''}
                  </span>
                  <div className="flex gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={
                          s <= r.rating
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-[#e8d5b7] fill-[#f0ece4]'
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Next review"
            className="absolute right-1 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-8 sm:w-10 h-8 sm:h-10 bg-white/95 hover:bg-white text-[#1a2e1a] rounded-full flex items-center justify-center shadow-lg border border-[#e8d5b7]/80 active:scale-90 transition-all cursor-pointer"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}
