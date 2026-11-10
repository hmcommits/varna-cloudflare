'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/context/StoreContext'

const shopLinks = [
  { label: 'New Arrivals', href: '/#new-arrivals' },
  { label: 'Men', href: '/#men' },
  { label: 'Women', href: '/#women' },
  { label: 'Collections', href: '/#collections' },
  { label: 'Sale', href: '/#sale' },
]
interface CustomerCareLink {
  label: string
  message: string
}

const customerCareLinks: CustomerCareLink[] = [
  {
    label: 'Custom Orders',
    message: "Hi Varna! I'm interested in placing a Custom Order (custom prints/embroidery). Could you guide me through the customization options and pricing?",
  },
  {
    label: 'Bulk Enquiries',
    message: "Hi Varna! I have a Bulk Enquiry for uniforms, corporate or event merchandise. Could you please share catalog details and bulk pricing?",
  },
  {
    label: 'Size Guide',
    message: "Hi Varna! I need assistance with sizing and fit measurements. Could you please help me pick the right size?",
  },
  {
    label: 'FAQs',
    message: "Hi Varna! I have questions regarding shipping, delivery timelines, and order tracking. Could you assist me?",
  },
  {
    label: 'Contact Us',
    message: "Hi Varna! I'd like to get in touch with your customer care concierge for assistance.",
  },
]

export default function Footer() {
  const router = useRouter()
  const pathname = usePathname()
  const { activeStore, selectCatalogFilter } = useStore()
  const [tapCount, setTapCount] = useState(0)
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    router.prefetch('/admin/login')
  }, [router])

  const handleShopLinkClick = (label: string, e: React.MouseEvent) => {
    e.preventDefault()
    const isHome = pathname === '/'

    if (label === 'Men') {
      selectCatalogFilter('Men', isHome)
      if (!isHome) {
        if (typeof window !== 'undefined') window.location.href = '/#men'
        else router.push('/#men')
      } else window.history.replaceState(null, '', '#men')
    } else if (label === 'Women') {
      selectCatalogFilter('Women', isHome)
      if (!isHome) {
        if (typeof window !== 'undefined') window.location.href = '/#women'
        else router.push('/#women')
      } else window.history.replaceState(null, '', '#women')
    } else if (label === 'New Arrivals') {
      selectCatalogFilter('All', isHome)
      if (!isHome) {
        if (typeof window !== 'undefined') window.location.href = '/#new-arrivals'
        else router.push('/#new-arrivals')
      } else window.history.replaceState(null, '', '#new-arrivals')
    } else if (label === 'Collections') {
      if (isHome) {
        const collectionsEl = document.getElementById('collections')
        if (collectionsEl) collectionsEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else selectCatalogFilter('All', true)
        window.history.replaceState(null, '', '#collections')
      } else {
        selectCatalogFilter('All', false)
        if (typeof window !== 'undefined') window.location.href = '/#collections'
        else router.push('/#collections')
      }
    } else if (label === 'Sale') {
      const hasActiveSale = (activeStore.promotions || []).some(
        (p) => p.active && p.saleProducts && p.saleProducts.length > 0
      )
      if (hasActiveSale) {
        if (isHome) {
          const saleEl = document.getElementById('sale')
          if (saleEl) saleEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
          else selectCatalogFilter('Sale', true)
          window.history.replaceState(null, '', '#sale')
        } else {
          if (typeof window !== 'undefined') window.location.href = '/#sale'
          else router.push('/#sale')
        }
      } else {
        selectCatalogFilter('All', isHome)
        if (!isHome) {
          if (typeof window !== 'undefined') window.location.href = '/#new-arrivals'
          else router.push('/#new-arrivals')
        } else window.history.replaceState(null, '', '#new-arrivals')
      }
    }
  }

  const handleFooterLogoTap = (e: React.MouseEvent) => {
    e.preventDefault()
    const isCurrentlyHome =
      pathname === '/' ||
      (typeof window !== 'undefined' && window.location.pathname === '/')

    if (!isCurrentlyHome) {
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      } else {
        router.push('/')
      }
      return
    }

    const next = tapCount + 1
    setTapCount(next)

    if (tapTimerRef.current) clearTimeout(tapTimerRef.current)

    if (next >= 5) {
      setTapCount(0)
      router.push('/admin/login')
      return
    }

    tapTimerRef.current = setTimeout(() => {
      if (next === 1) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      setTapCount(0)
    }, 450)
  }

  const supportPhone =
    activeStore.settings?.supportPhone ||
    (activeStore.whatsapp?.phoneNumber ? `+${activeStore.whatsapp.phoneNumber}` : '+91 6363145972')

  const rawDigits = (
    activeStore.settings?.supportPhone?.replace(/\D/g, '') ||
    activeStore.whatsapp?.phoneNumber?.replace(/\D/g, '') ||
    '916363145972'
  )
  const fullWaPhone = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits

  const getWaLink = (message: string) =>
    `https://wa.me/${fullWaPhone}?text=${encodeURIComponent(message)}`

  return (
    <footer className="bg-[#111] text-[#a89d8f] py-12 px-4 text-xs sm:text-sm border-t border-[#e8d5b7]/15">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-12 gap-8 mb-10">
        {/* Brand Description with Emblem & 5-Tap Gateway */}
        <div className="col-span-2 md:col-span-4 pr-0 md:pr-8">
          <div
            onClick={handleFooterLogoTap}
            className="flex items-center gap-3.5 mb-4 group cursor-pointer select-none"
            title="Varna Clothing Co."
          >
            <div className={`relative h-16 sm:h-20 lg:h-[84px] aspect-[831/469] flex-shrink-0 transition-transform ${tapCount > 0 ? 'scale-105' : ''}`}>
              <Image
                src="https://res.cloudinary.com/o6jv6xte/image/upload/v1793872123/varna_store/logo/varna-brandmark-transparent-gold-v3.webp"
                alt="Varna Clothing Co."
                fill
                sizes="(max-width: 640px) 140px, 180px"
                className="object-contain"
                unoptimized
              />
            </div>
            <div>
              <span className="font-display italic text-white text-2xl sm:text-3xl font-bold tracking-tight block leading-tight">
                Varna
              </span>
              <span className="text-[11px] uppercase tracking-wider text-[#e8d5b7] font-medium">
                Clothing Co. • Custom Wear
              </span>
            </div>
          </div>
          <p className="text-xs text-[#a89d8f] leading-relaxed max-w-sm mb-4">
            Custom wear, prints, t-shirts, jerseys &amp; hoodies. Crafted for comfort, curated to impress. Wear Your Colors with Varna.
          </p>
          <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-[#a89d8f]">
              <span>Enquiries:</span>
              <a
                href={getWaLink("Hi Varna! I'm interested in your styles and would like to place an enquiry.")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:underline font-semibold flex items-center gap-1"
              >
                {supportPhone}
              </a>
            </div>

            {/* Email Contact Pill */}
            <a
              href="mailto:varnaprints2026@gmail.com"
              className="inline-flex items-center gap-2 self-start py-1 px-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-[#e8d5b7] hover:text-white transition-all group"
              title="Email Varna: varnaprints2026@gmail.com"
            >
              <div className="relative w-4 h-4 flex-shrink-0">
                <Image
                  src="/images/gmail-logo.webp"
                  alt="Email"
                  fill
                  sizes="16px"
                  className="object-contain group-hover:scale-105 transition-transform"
                  unoptimized
                />
              </div>
              <span className="text-xs font-semibold tracking-wide">
                varnaprints2026@gmail.com
              </span>
            </a>

            {/* Instagram Pill */}
            <a
              href="https://www.instagram.com/varna_prints_/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 self-start py-1 px-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-[#e8d5b7] hover:text-white transition-all group"
              title="Follow @varna_prints_ on Instagram"
            >
              <div className="relative w-4 h-4 flex-shrink-0">
                <Image
                  src="/images/instagram-logo.webp"
                  alt="Instagram"
                  fill
                  sizes="16px"
                  className="object-contain group-hover:scale-105 transition-transform"
                  unoptimized
                />
              </div>
              <span className="text-xs font-semibold tracking-wide">
                @varna_prints_
              </span>
            </a>
          </div>
        </div>

        {/* Shop Navigation */}
        <div className="col-span-1 md:col-span-2">
          <h4 className="font-semibold text-white uppercase tracking-wider text-xs mb-3">Shop</h4>
          <ul className="space-y-2">
            {shopLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={(e) => handleShopLinkClick(link.label, e)}
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Care */}
        <div className="col-span-1 md:col-span-3">
          <h4 className="font-semibold text-white uppercase tracking-wider text-xs mb-3">Customer Care</h4>
          <ul className="space-y-2">
            {customerCareLinks.map((item) => (
              <li key={item.label}>
                <a
                  href={getWaLink(item.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Brand & Studio */}
        <div className="col-span-2 md:col-span-3">
          <h4 className="font-semibold text-white uppercase tracking-wider text-xs mb-3">Studio</h4>
          <p className="text-xs text-[#a89d8f] mb-3 leading-relaxed">
            {activeStore.settings?.studioAddress || 'Karkala, Udupi, Karnataka'}
          </p>
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2 text-[11px] text-[#7d7062]">
            <span>⚡ Ultra-fast WhatsApp Checkout</span>
            <a
              href="mailto:varnaprints2026@gmail.com"
              className="flex items-center gap-1.5 text-[#a89d8f] hover:text-white transition-colors"
            >
              <div className="relative w-3.5 h-3.5 flex-shrink-0">
                <Image
                  src="/images/gmail-logo.webp"
                  alt="Email"
                  fill
                  sizes="14px"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span>varnaprints2026@gmail.com</span>
            </a>
            <a
              href="https://www.instagram.com/varna_prints_/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#a89d8f] hover:text-[#e8d5b7] transition-colors"
            >
              <div className="relative w-3.5 h-3.5 flex-shrink-0">
                <Image
                  src="/images/instagram-logo.webp"
                  alt="Instagram"
                  fill
                  sizes="14px"
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span>Follow our new drops on Instagram</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7d7062]">
        <p>© 2026 Varna. All rights reserved. Crafted for comfort, curated to impress.</p>
        <p className="text-[11px]">Direct WhatsApp Concierge Commerce Engine</p>
      </div>
    </footer>
  )
}
