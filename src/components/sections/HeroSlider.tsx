'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useStore } from '@/context/StoreContext'
import { HeroSlide } from '@/types/store'

const defaultSlides: HeroSlide[] = [
  {
    id: 'hero-1',
    image:
      'https://res.cloudinary.com/o6jv6xte/image/upload/f_auto,q_auto:good/v1793532664/varna_store/hero/hero-slide-1.webp',
    badge: 'NEW SEASON',
    title: 'Everyday Style,\nElevated',
    subtitle: 'Modern fits for every mood. From workdays to weekends.',
    scriptText: 'Looks for every you',
    ctaPrimary: 'Shop Men →',
    ctaPrimaryFilter: 'Men',
    ctaSecondary: 'Shop Women',
    ctaSecondaryFilter: 'Women',
    mobilePosition: 'object-[72%_center]',
  },
  {
    id: 'hero-2',
    image:
      'https://res.cloudinary.com/o6jv6xte/image/upload/f_auto,q_auto:good/v1793532665/varna_store/hero/hero-slide-2.webp',
    badge: 'NEW COLLECTION',
    title: 'Festive Looks,\nRedefined',
    subtitle: 'Celebrate every occasion with style and grace.',
    scriptText: 'Dress to express',
    ctaPrimary: 'Shop Women →',
    ctaPrimaryFilter: 'Women',
    ctaSecondary: 'Shop Men',
    ctaSecondaryFilter: 'Men',
    mobilePosition: 'object-[78%_center]',
  },
  {
    id: 'hero-3',
    image:
      'https://res.cloudinary.com/o6jv6xte/image/upload/f_auto,q_auto:good/v1793532666/varna_store/hero/hero-slide-3.webp',
    badge: 'LINEN EDIT',
    title: 'Breathe Easy,\nLook Effortless',
    subtitle: 'Premium linen collection for every season.',
    scriptText: 'Comfort meets class',
    ctaPrimary: 'Shop Now →',
    ctaPrimaryFilter: 'All',
    ctaSecondary: 'View All',
    ctaSecondaryFilter: 'All',
    mobilePosition: 'object-[65%_center]',
  },
]

export default function HeroSlider() {
  const { activeStore, selectCatalogFilter } = useStore()
  const slides =
    activeStore.homepage?.heroSlides && activeStore.homepage.heroSlides.length > 0
      ? activeStore.homepage.heroSlides
      : defaultSlides

  const [current, setCurrent] = useState(0)
  const safeCurrent = current >= slides.length ? 0 : current
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide()
    }, 6500)
    return () => clearInterval(timer)
  }, [nextSlide])

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
    touchEndX.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 45
    const isRightSwipe = distance < -45

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
  }

  const handleCtaClick = (filter: string) => {
    selectCatalogFilter(filter, true)
  }

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[320px] sm:h-[400px] md:h-[540px] lg:h-[600px] overflow-hidden bg-[#1a2e1a] select-none"
    >
      {/* Invisible Interactive Tap Zones: Left tap -> Prev, Right tap -> Next */}
      <div
        onClick={prevSlide}
        aria-label="Previous slide area"
        className="absolute left-0 top-0 bottom-16 w-1/4 z-10 cursor-pointer"
        title="Tap to see previous slide"
      />
      <div
        onClick={nextSlide}
        aria-label="Next slide area"
        className="absolute right-0 top-0 bottom-16 w-1/3 z-10 cursor-pointer"
        title="Tap to see next slide"
      />

      {/* High-Resolution Background Slides with smooth crossfade */}
      {slides.map((s, idx) => (
        <div
          key={s.id || idx}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === safeCurrent ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
          }`}
        >
          <Image
            src={s.image}
            alt={s.badge || 'Hero Slide'}
            fill
            sizes="100vw"
            quality={80}
            priority={idx === 0}
            loading={idx === 0 ? 'eager' : 'lazy'}
            className={`object-cover ${s.mobilePosition || 'object-center'} md:object-center transition-all duration-700`}
          />
          {/* Mobile Gradient: darker at the bottom for text legibility, clear top half for models */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent md:hidden" />

          {/* Desktop Gradient: side-gradient from left to right */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
        </div>
      ))}

      {/* Slide Content */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 flex flex-col justify-end md:justify-center pb-12 sm:pb-14 md:pb-0 pointer-events-none">
        <div className="max-w-md md:max-w-lg text-white pointer-events-auto">
          {slides[safeCurrent]?.badge && (
            <p className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase mb-1 md:mb-2 text-[#e8d5b7]">
              {slides[safeCurrent].badge}
            </p>
          )}
          <h1 className="font-display text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.15] mb-1.5 sm:mb-2 md:mb-4 whitespace-pre-line drop-shadow-md">
            {slides[safeCurrent]?.title}
          </h1>
          {slides[safeCurrent]?.subtitle && (
            <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-gray-200 mb-3 sm:mb-4 md:mb-6 leading-relaxed line-clamp-2 md:line-clamp-none max-w-sm md:max-w-md drop-shadow">
              {slides[safeCurrent].subtitle}
            </p>
          )}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {slides[safeCurrent]?.ctaPrimary && (
              <button
                type="button"
                onClick={() => handleCtaClick(slides[safeCurrent]?.ctaPrimaryFilter || 'All')}
                className="bg-[#1a2e1a] text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-[#2d4a2d] active:scale-95 transition-all shadow-md cursor-pointer border border-[#e8d5b7]/30"
              >
                {slides[safeCurrent].ctaPrimary}
              </button>
            )}
            {slides[safeCurrent]?.ctaSecondary && (
              <button
                type="button"
                onClick={() => handleCtaClick(slides[safeCurrent]?.ctaSecondaryFilter || 'All')}
                className="border border-[#e8d5b7]/70 backdrop-blur-md bg-black/25 text-[#e8d5b7] hover:text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-white/20 active:scale-95 transition-all cursor-pointer shadow-md"
              >
                {slides[safeCurrent].ctaSecondary}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fluid Calligraphy Script on right with curved arrow flourish (desktop only) */}
      {slides[safeCurrent]?.scriptText && (
        <div className="absolute right-6 md:right-14 top-1/2 -translate-y-1/2 z-10 hidden md:block pointer-events-none select-none">
          <p className="font-script text-[#e8d5b7] text-5xl lg:text-6xl leading-tight text-right drop-shadow-lg transform -rotate-3">
            {slides[safeCurrent].scriptText}
          </p>
          <div className="mt-1 flex justify-end">
            <svg width="85" height="24" viewBox="0 0 85 24" fill="none" className="text-[#e8d5b7] opacity-80">
              <path
                d="M3 14 C25 2, 65 3, 80 12 M70 6 L81 12 L72 19"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Desktop Navigation Arrows (Far left and far right) */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/35 hover:bg-black/55 text-white rounded-full items-center justify-center backdrop-blur-md border border-[#e8d5b7]/30 shadow-md active:scale-90 transition-all cursor-pointer"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/35 hover:bg-black/55 text-white rounded-full items-center justify-center backdrop-blur-md border border-[#e8d5b7]/30 shadow-md active:scale-90 transition-all cursor-pointer"
      >
        <ChevronRight size={22} />
      </button>

      {/* Bottom Bar: Unique & Modern Frosted Bubble / Round Indicators + Mobile Arrow Controls */}
      <div className="absolute bottom-3 md:bottom-6 left-4 md:left-10 right-4 md:right-auto z-30 flex items-center justify-between md:justify-start gap-4">
        {/* Floating Glassmorphic Bubble Pod */}
        <div className="flex items-center gap-2 sm:gap-2.5 bg-black/40 backdrop-blur-xl px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-white/20 shadow-2xl">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`group relative flex items-center justify-center transition-all duration-300 cursor-pointer ${
                i === safeCurrent
                  ? 'w-5 h-5 sm:w-6 sm:h-6'
                  : 'w-2 h-2 sm:w-2.5 sm:h-2.5 opacity-50 hover:opacity-100 hover:scale-125'
              }`}
            >
              {i === safeCurrent ? (
                <>
                  {/* Outer Orbital Progress Ring (Modern Watch / Story Timer in 6.5s) */}
                  <svg
                    key={safeCurrent}
                    className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                    viewBox="0 0 24 24"
                  >
                    {/* Subtle track background */}
                    <circle
                      cx="12"
                      cy="12"
                      r="9.5"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    {/* Animated filling stroke */}
                    <circle
                      cx="12"
                      cy="12"
                      r="9.5"
                      stroke="#e8d5b7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="59.69"
                      strokeDashoffset="59.69"
                      fill="none"
                      className="animate-slide-progress drop-shadow-[0_0_4px_rgba(232,213,183,0.9)]"
                    />
                  </svg>

                  {/* Luminous Glowing Core Pearl */}
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#e8d5b7] shadow-[0_0_8px_#e8d5b7]" />
                </>
              ) : (
                /* Inactive Bubble: Translucent frosted glass pearl */
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/45 group-hover:bg-white group-hover:shadow-[0_0_8px_rgba(255,255,255,0.9)] border border-white/30 transition-all duration-300" />
              )}
            </button>
          ))}
        </div>

        {/* Mobile-only compact arrow buttons in bottom-right corner */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="w-7 h-7 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm active:scale-90 border border-white/20"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="w-7 h-7 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm active:scale-90 border border-white/20"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </section>
  )
}
