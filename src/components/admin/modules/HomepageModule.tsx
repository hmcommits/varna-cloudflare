'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { useStore } from '@/context/StoreContext'
import { HeroSlide, PromoBanner, WhyVarnaItem } from '@/types/store'
import { Plus, Trash2, Upload, ImageIcon, Check, ArrowUp, ArrowDown } from 'lucide-react'

const defaultHeroSlides: HeroSlide[] = [
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

export default function HomepageModule() {
  const { draft, updateDraft } = useStore()
  const [newChipText, setNewChipText] = useState('')
  const [uploadingBannerId, setUploadingBannerId] = useState<string | null>(null)
  const [uploadingHeroId, setUploadingHeroId] = useState<string | null>(null)

  const homepage = draft.homepage || {
    topBarVisible: true,
    topBarTexts: [],
    tickerChips: [],
    promoBanners: [],
    trustBadges: [],
  }

  const heroSlides =
    homepage.heroSlides && homepage.heroSlides.length > 0
      ? homepage.heroSlides
      : defaultHeroSlides

  // Hero Slider Handlers
  const handleAddHeroSlide = () => {
    const newSlide: HeroSlide = {
      id: `hero-${Date.now()}`,
      image:
        'https://res.cloudinary.com/o6jv6xte/image/upload/f_auto,q_auto:good/v1793532664/varna_store/hero/hero-slide-1.webp',
      badge: 'NEW DROP',
      title: 'New Headline,\nHandcrafted Fits',
      subtitle: 'Tailored comfort, custom embroidery and premium everyday silhouettes.',
      scriptText: 'Crafted for you',
      ctaPrimary: 'Shop Now →',
      ctaPrimaryFilter: 'All',
      ctaSecondary: 'View Collection',
      ctaSecondaryFilter: 'All',
      mobilePosition: 'object-center',
    }
    const currentSlides = homepage.heroSlides?.length ? homepage.heroSlides : defaultHeroSlides
    updateDraft((prev) => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        heroSlides: [...currentSlides, newSlide],
      },
    }))
  }

  const handleUpdateHeroSlide = (id: string, field: keyof HeroSlide, val: string) => {
    const currentSlides = homepage.heroSlides?.length ? homepage.heroSlides : defaultHeroSlides
    const updated = currentSlides.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    updateDraft((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, heroSlides: updated },
    }))
  }

  const handleDeleteHeroSlide = (id: string) => {
    const currentSlides = homepage.heroSlides?.length ? homepage.heroSlides : defaultHeroSlides
    if (currentSlides.length <= 1) {
      alert('You must keep at least 1 hero banner slide.')
      return
    }
    const updated = currentSlides.filter((s) => s.id !== id)
    updateDraft((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, heroSlides: updated },
    }))
  }

  const handleMoveHeroSlide = (index: number, direction: 'up' | 'down') => {
    const currentSlides = [...(homepage.heroSlides?.length ? homepage.heroSlides : defaultHeroSlides)]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= currentSlides.length) return
    const temp = currentSlides[index]
    currentSlides[index] = currentSlides[targetIndex]
    currentSlides[targetIndex] = temp
    updateDraft((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, heroSlides: currentSlides },
    }))
  }

  const handleUploadHeroImage = async (slideId: string, file: File) => {
    if (!file) return
    setUploadingHeroId(slideId)
    try {
      const adminToken =
        (typeof window !== 'undefined'
          ? sessionStorage.getItem('varna_admin_token')
          : null) ||
        draft.settings?.passcode ||
        'varna2026'

      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        handleUpdateHeroSlide(slideId, 'image', data.url)
      } else {
        alert(data.error || 'Failed to upload hero banner image.')
      }
    } catch (err) {
      console.error(err)
      alert('Error uploading hero banner image. Please try again.')
    } finally {
      setUploadingHeroId(null)
    }
  }

  // Top Bar Texts (Max 3)
  const handleUpdateTopBarText = (index: number, text: string) => {
    const updated = [...(homepage.topBarTexts || [])]
    updated[index] = text
    updateDraft((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, topBarTexts: updated },
    }))
  }

  const handleAddTopBarText = () => {
    if ((homepage.topBarTexts?.length || 0) >= 3) return
    const updated = [...(homepage.topBarTexts || []), 'New announcement message']
    updateDraft((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, topBarTexts: updated },
    }))
  }

  const handleRemoveTopBarText = (index: number) => {
    const updated = (homepage.topBarTexts || []).filter((_, i) => i !== index)
    updateDraft((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, topBarTexts: updated },
    }))
  }

  // Ticker Chips
  const handleAddTickerChip = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChipText.trim()) return
    const updated = [...(homepage.tickerChips || []), newChipText.trim()]
    updateDraft((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, tickerChips: updated },
    }))
    setNewChipText('')
  }

  const handleRemoveTickerChip = (index: number) => {
    const updated = (homepage.tickerChips || []).filter((_, i) => i !== index)
    updateDraft((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, tickerChips: updated },
    }))
  }

  // Split Promo Banners (Add / Edit / Remove)
  const handleAddBanner = () => {
    const newBanner: PromoBanner = {
      id: `banner-${Date.now()}`,
      title: 'New Collection Promo',
      subtitle: 'Limited Edition Drop',
      image:
        'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532662/varna_store/banners/banner-men.webp',
      link: '#new-arrivals',
      ctaText: 'Explore Collection →',
    }
    updateDraft((prev) => ({
      ...prev,
      homepage: {
        ...prev.homepage,
        promoBanners: [...(prev.homepage.promoBanners || []), newBanner],
      },
    }))
  }

  const handleUpdateBanner = (id: string, field: keyof PromoBanner, val: string) => {
    const updated = (homepage.promoBanners || []).map((b) =>
      b.id === id ? { ...b, [field]: val } : b
    )
    updateDraft((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, promoBanners: updated },
    }))
  }

  const handleUploadBannerImage = async (bannerId: string, file: File) => {
    if (!file) return
    setUploadingBannerId(bannerId)
    try {
      const adminToken =
        (typeof window !== 'undefined'
          ? sessionStorage.getItem('varna_admin_token')
          : null) ||
        draft.settings?.passcode ||
        'varna2026'

      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-token': adminToken },
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        handleUpdateBanner(bannerId, 'image', data.url)
      } else {
        alert(data.error || 'Failed to upload banner image.')
      }
    } catch (err) {
      console.error(err)
      alert('Error uploading banner image. Please try again.')
    } finally {
      setUploadingBannerId(null)
    }
  }

  const handleDeleteBanner = (id: string) => {
    if ((homepage.promoBanners || []).length <= 1) {
      alert('You should keep at least one promotional banner.')
      return
    }
    const updated = (homepage.promoBanners || []).filter((b) => b.id !== id)
    updateDraft((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, promoBanners: updated },
    }))
  }

  // Trust Badges
  const handleUpdateBadge = (id: string, field: 'title' | 'desc', val: string) => {
    const updated = (homepage.trustBadges || []).map((b) =>
      b.id === id ? { ...b, [field]: val } : b
    )
    updateDraft((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, trustBadges: updated },
    }))
  }

  // Why Varna Pillars
  const defaultWhyVarnaItems: WhyVarnaItem[] = [
    { id: 'wv-1', iconKey: 'shield', title: 'Premium Quality', sub: 'Crafted for comfort' },
    { id: 'wv-2', iconKey: 'sparkles', title: 'Trendy Designs', sub: 'Styles for every occasion' },
    { id: 'wv-3', iconKey: 'layers', title: 'Custom Printing', sub: 'Tees, Jerseys & Hoodies' },
    { id: 'wv-4', iconKey: 'users', title: 'Loved by 1M+', sub: 'A growing community' },
  ]
  const whyVarnaItems = homepage.whyVarnaItems?.length ? homepage.whyVarnaItems : defaultWhyVarnaItems
  const whyVarnaTitle = homepage.whyVarnaTitle || 'Why Shop Varna?'

  const handleUpdateWhyVarnaTitle = (val: string) => {
    updateDraft((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, whyVarnaTitle: val },
    }))
  }

  const handleUpdateWhyVarnaItem = (id: string, field: 'title' | 'sub', val: string) => {
    const updated = whyVarnaItems.map((item) =>
      item.id === id ? { ...item, [field]: val } : item
    )
    updateDraft((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, whyVarnaItems: updated },
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#ebe5da] rounded-3xl p-6 shadow-2xs">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#845d1d] font-mono">
            VISUAL MERCHANDISING
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#142319] mt-0.5">
            Homepage Editor &amp; Banners
          </h2>
          <p className="text-xs text-[#6b7770] mt-0.5">
            Full-width hero banner carousel, top announcement bar, marquee ticker, split promo banners &amp; trust guarantees
          </p>
        </div>
      </div>

      {/* 1. HERO BANNERS & SLIDER SECTION */}
      <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0eae1]">
          <div>
            <h3 className="font-display text-base sm:text-lg font-bold text-[#142319] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#c4a675] border border-[#a88a58]" />
              <span>Hero Banners &amp; Slider ({heroSlides.length} Active Slides)</span>
            </h3>
            <p className="text-xs text-[#6b7770]">
              The full-width high-resolution hero banner carousel at the very top of your storefront. Customize background photos, titles, subtitles, cursive calligraphy notes, and CTA shopping buttons.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddHeroSlide}
            className="self-start sm:self-auto flex items-center gap-1.5 py-2 px-4 bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-97 cursor-pointer"
          >
            <Plus size={14} />
            <span>+ Add Hero Slide</span>
          </button>
        </div>

        {/* List of Hero Slides */}
        <div className="space-y-6">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className="bg-[#faf8f5] border border-[#ded7cb] rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs transition-all hover:border-[#c4a675]/60"
            >
              {/* Header Bar: Slide Number, Badge & Reorder/Delete */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#ebe5da]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 bg-[#142319] text-[#e8d5b7] font-mono text-xs font-bold rounded-lg">
                    Slide #{idx + 1}
                  </span>
                  {slide.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#845d1d] bg-[#f5ede0] px-2 py-0.5 rounded-md border border-[#e5d5be]">
                      {slide.badge}
                    </span>
                  )}
                  <span className="text-xs font-medium text-[#6b7770] truncate max-w-xs">
                    {slide.title.replace(/\n/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveHeroSlide(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 text-[#6b7770] hover:text-[#142319] hover:bg-white rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Move Slide Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveHeroSlide(idx, 'down')}
                    disabled={idx === heroSlides.length - 1}
                    className="p-1.5 text-[#6b7770] hover:text-[#142319] hover:bg-white rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Move Slide Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteHeroSlide(slide.id)}
                    className="p-1.5 text-[#b84840] hover:bg-[#fdf0ef] rounded-lg transition-colors cursor-pointer ml-1"
                    title="Delete Slide"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Grid: Left Column (Banner Image & Upload) | Right Column (Texts & CTAs) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column (5 cols) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden bg-[#1a2e1a] border border-[#ded7cb] shadow-inner group/heroimg">
                    {slide.image ? (
                      <Image
                        src={slide.image}
                        alt={slide.badge || 'Hero Slide'}
                        fill
                        className={`object-cover ${slide.mobilePosition || 'object-center'}`}
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#e8d5b7] gap-2">
                        <ImageIcon size={32} />
                        <span className="text-xs">No image provided</span>
                      </div>
                    )}

                    {/* Gradient Overlay Preview */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                    {/* Live Badge & Title Preview on Image */}
                    <div className="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none">
                      <p className="text-[9px] font-bold tracking-widest uppercase text-[#e8d5b7]">
                        {slide.badge || 'BADGE'}
                      </p>
                      <p className="font-display text-sm font-bold truncate">
                        {slide.title.replace(/\n/g, ' ') || 'Hero Headline'}
                      </p>
                    </div>

                    {/* Hover Upload Overlay */}
                    <label className="absolute inset-0 bg-black/55 opacity-0 group-hover/heroimg:opacity-100 flex flex-col items-center justify-center text-white font-bold text-xs cursor-pointer transition-opacity backdrop-blur-xs gap-1.5 p-3 text-center">
                      <Upload size={22} className="text-[#e8d5b7]" />
                      <span>
                        {uploadingHeroId === slide.id
                          ? 'Uploading photo...'
                          : 'Click to Replace Banner Photo'}
                      </span>
                      <span className="text-[10px] text-[#e8d5b7]/90 font-normal">
                        Click anywhere to pick a new photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingHeroId === slide.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleUploadHeroImage(slide.id, file)
                          e.target.value = ''
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Upload Action Button + Ready Indicator */}
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-[#1c3624] hover:text-white border border-[#ded7cb] hover:border-[#1c3624] text-[#1c3624] font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer">
                      <Upload size={13} />
                      <span>
                        {uploadingHeroId === slide.id
                          ? 'Uploading...'
                          : 'Upload / Replace Photo'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingHeroId === slide.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleUploadHeroImage(slide.id, file)
                          e.target.value = ''
                        }}
                        className="hidden"
                      />
                    </label>

                    {slide.image && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#206035] bg-[#eef7f0] px-2.5 py-2 rounded-xl border border-[#d6ecda]">
                        <Check size={12} />
                        <span>Photo Ready</span>
                      </span>
                    )}
                  </div>

                  {/* Mobile Focal Alignment Preset */}
                  <div>
                    <label className="block text-[10px] font-semibold text-[#6b7770] mb-1">
                      Mobile Photo Framing (Adjust if model is off-center on mobile)
                    </label>
                    <select
                      value={slide.mobilePosition || 'object-[72%_center]'}
                      onChange={(e) =>
                        handleUpdateHeroSlide(slide.id, 'mobilePosition', e.target.value)
                      }
                      className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2.5 py-1.5 text-xs text-[#142319] outline-hidden cursor-pointer"
                    >
                      <option value="object-[72%_center]">Right Model Focus (Recommended for fashion poses)</option>
                      <option value="object-[78%_center]">Far Right Focus</option>
                      <option value="object-[65%_center]">Center-Right Focus</option>
                      <option value="object-center">Centered</option>
                      <option value="object-[35%_center]">Left Focus</option>
                    </select>
                  </div>
                </div>

                {/* Right Column (7 cols): Texts & CTA Buttons */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Badge Pill */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#845d1d] mb-1">
                        Badge Pill (Category / Tag)
                      </label>
                      <input
                        type="text"
                        value={slide.badge}
                        onChange={(e) => handleUpdateHeroSlide(slide.id, 'badge', e.target.value)}
                        placeholder="e.g. NEW SEASON, LINEN EDIT"
                        className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2.5 py-1.5 text-xs text-[#142319] font-bold outline-hidden uppercase"
                      />
                    </div>

                    {/* Calligraphy Script Text (Desktop Only) */}
                    <div>
                      <label className="block text-[10px] font-bold tracking-wider text-[#6b7770] mb-1">
                        Cursive Calligraphy Note (Desktop Flourish)
                      </label>
                      <input
                        type="text"
                        value={slide.scriptText || ''}
                        onChange={(e) =>
                          handleUpdateHeroSlide(slide.id, 'scriptText', e.target.value)
                        }
                        placeholder="e.g. Looks for every you"
                        className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2.5 py-1.5 text-xs text-[#142319] outline-hidden italic"
                      />
                    </div>
                  </div>

                  {/* Main Headline Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#142319]">
                        Main Headline Title
                      </label>
                      <span className="text-[10px] text-[#8c978f] font-mono">
                        (Tip: Press Enter for multi-line)
                      </span>
                    </div>
                    <textarea
                      value={slide.title}
                      onChange={(e) => handleUpdateHeroSlide(slide.id, 'title', e.target.value)}
                      rows={2}
                      placeholder="e.g. Everyday Style,\nElevated"
                      className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg p-2.5 text-xs sm:text-sm font-display font-bold text-[#142319] outline-hidden resize-none"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-[10px] font-semibold text-[#6b7770] mb-1">
                      Subtitle Description
                    </label>
                    <textarea
                      value={slide.subtitle}
                      onChange={(e) => handleUpdateHeroSlide(slide.id, 'subtitle', e.target.value)}
                      rows={2}
                      placeholder="e.g. Modern fits for every mood. From workdays to weekends."
                      className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg p-2 text-xs text-[#6b7770] outline-hidden resize-none"
                    />
                  </div>

                  {/* CTA Buttons Row */}
                  <div className="pt-2 border-t border-[#ebe5da] grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Primary Button */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ded7cb]">
                      <span className="text-[10px] font-bold uppercase text-[#1c3624] block">
                        Primary CTA Button (Solid Green)
                      </span>
                      <input
                        type="text"
                        value={slide.ctaPrimary}
                        onChange={(e) =>
                          handleUpdateHeroSlide(slide.id, 'ctaPrimary', e.target.value)
                        }
                        placeholder="Button Text, e.g. Shop Men →"
                        className="w-full bg-[#faf8f5] border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2.5 py-1.5 text-xs text-[#142319] font-bold outline-hidden"
                      />
                      <div className="flex items-center gap-1.5 text-[10px] text-[#6b7770]">
                        <span>Filter:</span>
                        <select
                          value={slide.ctaPrimaryFilter || 'All'}
                          onChange={(e) =>
                            handleUpdateHeroSlide(slide.id, 'ctaPrimaryFilter', e.target.value)
                          }
                          className="flex-1 bg-white border border-[#ded7cb] rounded px-1.5 py-1 text-[11px] text-[#142319] outline-hidden cursor-pointer"
                        >
                          <option value="All">All Products</option>
                          <option value="Men">Men</option>
                          <option value="Women">Women</option>
                          <option value="Sale">Sale / Promotions</option>
                        </select>
                      </div>
                    </div>

                    {/* Secondary Button */}
                    <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ded7cb]">
                      <span className="text-[10px] font-bold uppercase text-[#845d1d] block">
                        Secondary CTA Button (Glass Outline)
                      </span>
                      <input
                        type="text"
                        value={slide.ctaSecondary}
                        onChange={(e) =>
                          handleUpdateHeroSlide(slide.id, 'ctaSecondary', e.target.value)
                        }
                        placeholder="Button Text, e.g. Shop Women"
                        className="w-full bg-[#faf8f5] border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2.5 py-1.5 text-xs text-[#142319] font-bold outline-hidden"
                      />
                      <div className="flex items-center gap-1.5 text-[10px] text-[#6b7770]">
                        <span>Filter:</span>
                        <select
                          value={slide.ctaSecondaryFilter || 'All'}
                          onChange={(e) =>
                            handleUpdateHeroSlide(slide.id, 'ctaSecondaryFilter', e.target.value)
                          }
                          className="flex-1 bg-white border border-[#ded7cb] rounded px-1.5 py-1 text-[11px] text-[#142319] outline-hidden cursor-pointer"
                        >
                          <option value="All">All Products</option>
                          <option value="Women">Women</option>
                          <option value="Men">Men</option>
                          <option value="Sale">Sale / Promotions</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. TOP GREEN ANNOUNCEMENT BAR (MAX 3 FIELDS) */}
      <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-[#142319] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#1c3624] border border-[#1c3624]" />
              <span>Top Announcement Bar</span>
            </h3>
            <p className="text-xs text-[#6b7770]">
              The announcement bar running at the very top of the storefront. Enter up to 3 rotating announcements.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-semibold text-[#142319]">
              {homepage.topBarVisible ? 'Visible ON' : 'Hidden OFF'}
            </span>
            <input
              type="checkbox"
              checked={homepage.topBarVisible}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  homepage: { ...prev.homepage, topBarVisible: e.target.checked },
                }))
              }
              className="w-4 h-4 rounded text-[#1c3624] focus:ring-[#1c3624] cursor-pointer"
            />
          </label>
        </div>

        {/* Text Fields (Max 3) */}
        <div className="space-y-3 pt-2">
          {(homepage.topBarTexts || []).map((text, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#845d1d] w-16">Text {idx + 1}:</span>
              <input
                type="text"
                value={text}
                onChange={(e) => handleUpdateTopBarText(idx, e.target.value)}
                placeholder="Enter announcement text..."
                className="flex-1 bg-white border border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] rounded-xl px-3.5 py-2 text-xs text-[#142319] outline-hidden placeholder-[#8c978f]"
              />
              <button
                type="button"
                onClick={() => handleRemoveTopBarText(idx)}
                className="p-2 text-[#b84840] hover:bg-[#fdf0ef] rounded-lg transition-colors cursor-pointer"
                title="Remove this text"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {(homepage.topBarTexts?.length || 0) < 3 && (
            <button
              type="button"
              onClick={handleAddTopBarText}
              className="mt-2 text-xs text-[#206035] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>+ Add Field ({(homepage.topBarTexts?.length || 0)} of 3 used)</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. TRENDING TICKER MARQUEE */}
      <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-[#142319]">
            Trending Ticker Chips (Marquee Bar)
          </h3>
          <p className="text-xs text-[#6b7770]">
            The horizontal running ticker below the hero. Add or remove promotion chips.
          </p>
        </div>

        {/* Existing Chips List */}
        <div className="flex flex-wrap gap-2">
          {(homepage.tickerChips || []).map((chip, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-2 bg-[#faf6f0] border border-[#ded7cb] text-[#142319] px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-2xs"
            >
              <span>{chip}</span>
              <button
                type="button"
                onClick={() => handleRemoveTickerChip(idx)}
                className="text-[#8c978f] hover:text-[#b84840] cursor-pointer"
                title="Delete Chip"
              >
                <Trash2 size={11} />
              </button>
            </span>
          ))}
        </div>

        {/* Add New Chip Form */}
        <form onSubmit={handleAddTickerChip} className="flex items-center gap-2 max-w-md pt-2">
          <input
            type="text"
            value={newChipText}
            onChange={(e) => setNewChipText(e.target.value)}
            placeholder="e.g., ⚡ FLAT 20% OFF FIRST CUSTOM ORDER"
            className="flex-1 bg-white border border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] rounded-xl px-3 py-2 text-xs text-[#142319] outline-hidden placeholder-[#8c978f]"
          />
          <button
            type="submit"
            className="py-2 px-4 bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-97 cursor-pointer"
          >
            + Add Chip
          </button>
        </form>
      </div>

      {/* 4. DYNAMIC SPLIT PROMO BANNERS */}
      <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-[#142319] flex items-center gap-2">
              <span>Split Promo Banners</span>
              <span className="text-[10px] bg-[#eaf6ec] text-[#246b38] border border-[#cbe8d1] px-2 py-0.5 rounded-full font-mono font-bold">
                Adaptive Grid Layout
              </span>
            </h3>
            <p className="text-xs text-[#6b7770]">
              Add or delete promo banners. The storefront automatically balances 1, 2, 3, or 4 banners with perfect aesthetics!
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddBanner}
            className="flex items-center gap-1 py-1.5 px-3.5 bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-97 cursor-pointer"
          >
            <Plus size={13} />
            <span>+ Add Banner</span>
          </button>
        </div>

        {/* Banners List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {(homepage.promoBanners || []).map((banner, idx) => (
            <div
              key={banner.id}
              className="bg-[#faf8f5] border border-[#ded7cb] rounded-2xl p-4 space-y-3 relative group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#845d1d] font-bold">
                  Banner #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="text-[#8c978f] hover:text-[#b84840] p-1 transition-colors cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Visual Banner Preview Image & Direct Upload */}
              <div className="space-y-2">
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#ebe5da] border border-[#ded7cb] shadow-inner group/img">
                  {banner.image ? (
                    <Image
                      src={banner.image}
                      alt={banner.title || 'Promo Banner'}
                      fill
                      className="object-cover object-top"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#8c978f] gap-1">
                      <ImageIcon size={28} />
                      <span className="text-xs">No image selected</span>
                    </div>
                  )}

                  {/* Hover upload overlay */}
                  <label className="absolute inset-0 bg-black/45 opacity-0 group-hover/img:opacity-100 flex flex-col items-center justify-center text-white font-bold text-xs cursor-pointer transition-opacity backdrop-blur-xs gap-1.5 p-3 text-center">
                    <Upload size={20} />
                    <span>
                      {uploadingBannerId === banner.id
                        ? 'Uploading photo...'
                        : 'Click to Change Banner Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingBannerId === banner.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleUploadBannerImage(banner.id, file)
                        e.target.value = ''
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Upload Action Button for easy access on mobile/desktop */}
                <div className="flex items-center justify-between gap-2">
                  <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-[#1c3624] hover:text-white border border-[#ded7cb] hover:border-[#1c3624] text-[#1c3624] font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer">
                    <Upload size={13} />
                    <span>
                      {uploadingBannerId === banner.id
                        ? 'Uploading...'
                        : 'Upload / Change Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingBannerId === banner.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleUploadBannerImage(banner.id, file)
                        e.target.value = ''
                      }}
                      className="hidden"
                    />
                  </label>

                  {banner.image && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#206035] bg-[#eef7f0] px-2 py-1 rounded-lg border border-[#d6ecda]">
                      <Check size={11} />
                      <span>Ready</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-2 pt-1">
                <div>
                  <label className="block text-[10px] font-semibold text-[#6b7770] mb-0.5">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={banner.title}
                    onChange={(e) => handleUpdateBanner(banner.id, 'title', e.target.value)}
                    className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2.5 py-1.5 text-xs text-[#142319] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#6b7770] mb-0.5">
                    Subtitle / Tag
                  </label>
                  <input
                    type="text"
                    value={banner.subtitle}
                    onChange={(e) => handleUpdateBanner(banner.id, 'subtitle', e.target.value)}
                    className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2.5 py-1.5 text-xs text-[#142319] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#6b7770] mb-0.5">
                    Button CTA
                  </label>
                  <input
                    type="text"
                    value={banner.ctaText}
                    onChange={(e) => handleUpdateBanner(banner.id, 'ctaText', e.target.value)}
                    className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2.5 py-1.5 text-xs text-[#142319] outline-hidden"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. TRUST BADGES ("WHY VARNA") */}
      <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-[#142319]">
            Trust Badges &amp; Guarantees (&ldquo;Why Varna&rdquo;)
          </h3>
          <p className="text-xs text-[#6b7770]">
            The 4 service guarantees displayed to build customer confidence
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {(homepage.trustBadges || []).map((badge) => (
            <div
              key={badge.id}
              className="bg-[#faf8f5] border border-[#ded7cb] rounded-2xl p-3.5 space-y-2 shadow-2xs"
            >
              <input
                type="text"
                value={badge.title}
                onChange={(e) => handleUpdateBadge(badge.id, 'title', e.target.value)}
                className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2.5 py-1.5 text-xs text-[#142319] font-bold outline-hidden"
              />
              <textarea
                value={badge.desc}
                onChange={(e) => handleUpdateBadge(badge.id, 'desc', e.target.value)}
                rows={2}
                className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg p-2 text-[11px] text-[#6b7770] outline-hidden resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 6. WHY SHOP VARNA? BRAND PILLARS */}
      <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-[#142319] flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#845d1d] border border-[#845d1d]" />
            <span>Why Shop Varna? (Brand Pillars)</span>
          </h3>
          <p className="text-xs text-[#6b7770]">
            Customize the headline and core value props highlighted to customers above testimonials
          </p>
        </div>

        {/* Section Heading */}
        <div className="pt-1">
          <label className="block text-xs font-bold text-[#142319] mb-1">
            Section Title
          </label>
          <input
            type="text"
            value={whyVarnaTitle}
            onChange={(e) => handleUpdateWhyVarnaTitle(e.target.value)}
            placeholder="e.g. Why Shop Varna?"
            className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-xl px-3.5 py-2 text-xs text-[#142319] font-bold outline-hidden"
          />
        </div>

        {/* 4 Brand Pillar Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {whyVarnaItems.map((item, idx) => (
            <div
              key={item.id}
              className="bg-[#faf8f5] border border-[#ded7cb] rounded-2xl p-3.5 space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-[#845d1d]">
                  Pillar {idx + 1}
                </span>
                <span className="text-[10px] text-[#6b7770] font-mono">
                  Icon: {item.iconKey || 'shield'}
                </span>
              </div>
              <input
                type="text"
                value={item.title}
                onChange={(e) => handleUpdateWhyVarnaItem(item.id, 'title', e.target.value)}
                placeholder="Pillar title..."
                className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2.5 py-1.5 text-xs text-[#142319] font-bold outline-hidden"
              />
              <input
                type="text"
                value={item.sub}
                onChange={(e) => handleUpdateWhyVarnaItem(item.id, 'sub', e.target.value)}
                placeholder="Pillar subtitle..."
                className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-lg px-2.5 py-1.5 text-[11px] text-[#6b7770] outline-hidden"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
