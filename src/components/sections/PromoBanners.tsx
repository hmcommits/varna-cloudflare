'use client'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { useStore } from '@/context/StoreContext'
import { PromoBanner } from '@/types/store'

const DEFAULT_BANNERS: PromoBanner[] = [
  {
    id: 'men-banner',
    title: 'Effortless\nEveryday Fits',
    subtitle: 'Shirts, tees, jeans and more crafted for the modern man.',
    image: '/images/banners/men-banner.webp',
    link: '#men',
    ctaText: 'Shop Men',
  },
  {
    id: 'women-banner',
    title: 'Style\nWithout Limits',
    subtitle: 'Dresses, tops, co-ords and more for every occasion.',
    image: '/images/banners/women-banner.webp',
    link: '#women',
    ctaText: 'Shop Women',
  },
]

export default function PromoBanners() {
  const { activeStore, selectCatalogFilter } = useStore()
  const banners = activeStore.homepage?.promoBanners?.length
    ? activeStore.homepage.promoBanners
    : DEFAULT_BANNERS

  const handleBannerClick = (e: React.MouseEvent, b: PromoBanner) => {
    e.preventDefault()
    const lowerTitle = b.title.toLowerCase()
    const lowerCta = (b.ctaText || '').toLowerCase()
    const lowerLink = (b.link || '').toLowerCase()

    if (
      b.id === 'banner-women' ||
      lowerTitle.includes('women') ||
      lowerCta.includes('women') ||
      lowerLink.includes('women')
    ) {
      selectCatalogFilter('Women', true)
    } else if (
      b.id === 'banner-men' ||
      lowerTitle.includes('men') ||
      lowerCta.includes('men') ||
      lowerLink.includes('men')
    ) {
      selectCatalogFilter('Men', true)
    } else {
      selectCatalogFilter('All', true)
    }
  }

  if (banners.length === 0) return null

  // Adaptive grid layout classes based on banner count
  let gridColsClass = 'grid-cols-1 md:grid-cols-2'
  if (banners.length === 1) gridColsClass = 'grid-cols-1 max-w-4xl mx-auto'
  else if (banners.length === 3) gridColsClass = 'grid-cols-1 md:grid-cols-3'
  else if (banners.length >= 4) gridColsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

  return (
    <section className="py-6 md:py-10 px-4 bg-[#faf8f4]">
      <div className={`max-w-7xl mx-auto grid ${gridColsClass} gap-4 md:gap-6`}>
        {banners.map((b) => (
          <div
            key={b.id}
            className="relative h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden bg-[#c4a882] shadow-xs hover:shadow-lg border border-[#e8d5b7]/40 group transition-all duration-300"
          >
            <Image
              src={b.image}
              alt={b.title.replace('\n', ' ')}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
            <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 right-6 text-white max-w-xs">
              <h3 className="font-display text-2xl sm:text-3xl font-bold mb-2 leading-tight drop-shadow-sm whitespace-pre-line">
                {b.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#e8d5b7]/90 mb-4 sm:mb-5 leading-relaxed line-clamp-2">
                {b.subtitle}
              </p>
              <a
                href={b.link || '#'}
                onClick={(e) => handleBannerClick(e, b)}
                className="inline-flex items-center gap-2 bg-white text-[#1a2e1a] px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold hover:bg-[#faf8f4] active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <span>{b.ctaText || 'Explore'}</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
