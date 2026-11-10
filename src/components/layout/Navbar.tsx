'use client'
import { useState, useRef, useEffect } from 'react'
import { Search, Menu, X, Shield, Lock, Phone, ShoppingBag, Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/context/StoreContext'
import { useCart } from '@/context/CartContext'

const navLinks = [
  { label: 'New Arrivals', href: '/#new-arrivals' },
  { label: 'Men', href: '/#men' },
  { label: 'Women', href: '/#women' },
  { label: 'Collections', href: '/#collections' },
  { label: 'Sale', href: '/#sale', isRed: true },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { activeStore, searchQuery, setSearchQuery, selectCatalogFilter } = useStore()
  const { openCart, totalItems, isBagAnimating } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)

  const supportPhone = activeStore.settings?.supportPhone || '+91 6363145972'
  const cleanPhone = supportPhone.replace(/[^0-9+]/g, '')
  const supportEmail = activeStore.settings?.supportEmail || 'varnaprints2026@gmail.com'
  const instagramUrl = activeStore.settings?.instagramUrl || 'https://www.instagram.com/varna_prints_/'
  const instagramHandle = activeStore.settings?.instagramHandle || 'varna_prints_'

  // 5-Tap Easter Egg Detection
  const [tapCount, setTapCount] = useState(0)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Prefetch admin routes in background so the 5-tap transition is instant
  useEffect(() => {
    router.prefetch('/admin/login')
    router.prefetch('/admin')
  }, [router])

  const handleLogoTap = (e: React.MouseEvent) => {
    const isCurrentlyHome =
      pathname === '/' ||
      (typeof window !== 'undefined' && window.location.pathname === '/')

    // If user is on a product page or any subpage, immediately redirect to main storefront
    if (!isCurrentlyHome) {
      e.preventDefault()
      e.stopPropagation()
      setMobileOpen(false)
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      } else {
        router.push('/')
      }
      return
    }

    // On the homepage, intercept default navigation so tapping 1, 2, 3, 4 times doesn't trigger page reloads
    e.preventDefault()

    const nextCount = tapCount + 1
    setTapCount(nextCount)

    // Optional haptic pulse on mobile devices
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30)
    }

    if (tapTimerRef.current) clearTimeout(tapTimerRef.current)

    // On 5th tap -> Immediate Vault Unlock
    if (nextCount >= 5) {
      setIsUnlocking(true)
      setTapCount(0)

      // If this device was remembered with "Remember Me", log in immediately without password
      if (typeof window !== 'undefined') {
        const isRemembered =
          localStorage.getItem('varna_remember_device') === 'true' &&
          Boolean(localStorage.getItem('varna_admin_token'))

        if (isRemembered) {
          const token = localStorage.getItem('varna_admin_token') || ''
          sessionStorage.setItem('varna_admin_session', 'true')
          sessionStorage.setItem('varna_admin_token', token)
          localStorage.setItem('varna_admin_authenticated', 'true')
          document.cookie = `varna_admin_session=authenticated; path=/; max-age=31536000; SameSite=Lax`
          router.push('/admin')
          return
        }
      }

      router.push('/admin/login')
      return
    }

    // Reset tap counter if user stops tapping after 450ms
    tapTimerRef.current = setTimeout(() => {
      // If user tapped on homepage, scroll to top
      if (nextCount === 1) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      setTapCount(0)
    }, 450)
  }

  const logoSrc =
    activeStore.settings?.logoUrl &&
    !activeStore.settings.logoUrl.includes('varna-emblem') &&
    !activeStore.settings.logoUrl.includes('1793867092112') &&
    !activeStore.settings.logoUrl.includes('varna-curved-brandmark')
      ? activeStore.settings.logoUrl
      : 'https://res.cloudinary.com/o6jv6xte/image/upload/v1793872122/varna_store/logo/varna-brandmark-transparent-v3.webp'
  const storeName = activeStore.settings?.storeName || 'Varna'

  const handleNavLinkClick = (label: string, e: React.MouseEvent) => {
    const isHome = pathname === '/'

    if (!isHome) {
      // User is on a product details page or any subpage -> smoothly route to storefront section
      setMobileOpen(false)
      if (typeof window !== 'undefined') {
        if (label === 'Men') {
          sessionStorage.setItem('varna_catalog_filter', 'Men')
          window.location.href = '/#men'
        } else if (label === 'Women') {
          sessionStorage.setItem('varna_catalog_filter', 'Women')
          window.location.href = '/#women'
        } else if (label === 'New Arrivals') {
          sessionStorage.setItem('varna_catalog_filter', 'All')
          window.location.href = '/#new-arrivals'
        } else if (label === 'Collections') {
          window.location.href = '/#collections'
        } else if (label === 'Sale') {
          sessionStorage.setItem('varna_catalog_filter', 'Sale')
          window.location.href = '/#sale'
        } else {
          window.location.href = '/'
        }
      }
      return
    }

    // On Homepage, perform instant smooth scrolling without full-page reloads
    e.preventDefault()
    if (label === 'Men') {
      selectCatalogFilter('Men', true)
      window.history.replaceState(null, '', '#men')
    } else if (label === 'Women') {
      selectCatalogFilter('Women', true)
      window.history.replaceState(null, '', '#women')
    } else if (label === 'New Arrivals') {
      selectCatalogFilter('All', true)
      window.history.replaceState(null, '', '#new-arrivals')
    } else if (label === 'Collections') {
      const collectionsEl = document.getElementById('collections')
      if (collectionsEl) {
        collectionsEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        selectCatalogFilter('All', true)
      }
      window.history.replaceState(null, '', '#collections')
    } else if (label === 'Sale') {
      const saleEl = document.getElementById('sale')
      if (saleEl) {
        saleEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        selectCatalogFilter('Sale', true)
      }
      window.history.replaceState(null, '', '#sale')
    }
    setMobileOpen(false)
  }

  const handleSearchTrigger = () => {
    setMobileOpen(false)
    if (pathname === '/') {
      const el = document.getElementById('new-arrivals')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      if (searchQuery.trim()) {
        try {
          sessionStorage.setItem('varna_search_query', searchQuery.trim())
        } catch {
          // sessionStorage restricted
        }
      }
      if (typeof window !== 'undefined') {
        window.location.href = '/#new-arrivals'
      } else {
        router.push('/')
      }
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchTrigger()
    }
  }

  return (
    <>
      {/* Full-Screen Vault Entry Transition Overlay */}
      {isUnlocking && (
        <div className="fixed inset-0 z-50 bg-[#0f1d14]/95 backdrop-blur-md flex flex-col items-center justify-center text-white animate-in fade-in duration-200">
          <div className="relative h-20 sm:h-24 aspect-[831/469] rounded-2xl overflow-hidden p-2 mx-auto mb-4 animate-pulse">
            <Image
              src="https://res.cloudinary.com/o6jv6xte/image/upload/v1793872123/varna_store/logo/varna-brandmark-transparent-gold-v3.webp"
              alt="Varna"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-[#c4a675]" />
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#f4efe6]">
              Varna Command Vault
            </h2>
          </div>
          <p className="text-xs text-[#9eb3a2] font-mono uppercase tracking-widest flex items-center gap-1.5 mt-1">
            <Lock size={12} className="text-[#25D366]" />
            <span>Authenticating Secure Access...</span>
          </p>
          <div className="w-56 h-1.5 bg-white/10 rounded-full overflow-hidden mt-6">
            <div className="w-full h-full bg-gradient-to-r from-[#c4a675] via-[#25D366] to-[#c4a675] rounded-full animate-pulse" />
          </div>
        </div>
      )}

      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-[#e8d5b7]/50 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between h-[82px] min-[400px]:h-[88px] sm:h-[92px] lg:h-[102px] xl:h-[108px]">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden -ml-1 sm:-ml-2 p-2 text-[#3d362e] hover:text-black hover:bg-[#faf8f4] rounded-lg transition-colors cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Brand Logo with 5-Tap Unlock Trigger */}
          <Link
            href="/"
            onClick={handleLogoTap}
            className={`flex items-center py-1 relative select-none transition-all cursor-pointer ${
              isUnlocking ? 'scale-105' : ''
            }`}
            title="Varna Clothing Co."
          >
            <div
              className={`relative h-[64px] min-[400px]:h-[70px] sm:h-[74px] lg:h-[84px] xl:h-[92px] aspect-[831/469] flex-shrink-0 transition-all duration-300 ${
                isUnlocking
                  ? 'scale-110 drop-shadow-[0_0_15px_#c4a675] animate-pulse'
                  : tapCount > 0
                  ? 'scale-105 opacity-90'
                  : ''
              }`}
            >
              <Image
                src={logoSrc}
                alt={storeName || 'Varna Clothing Co.'}
                fill
                sizes="(max-width: 640px) 180px, (max-width: 1024px) 220px, 280px"
                className="object-contain"
                unoptimized
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavLinkClick(link.label, e)}
                className={`text-sm font-medium tracking-wide transition-colors py-1 relative group cursor-pointer ${
                  link.isRed ? 'text-[#c85a44] font-semibold' : 'text-[#3d362e] hover:text-[#1a2e1a]'
                }`}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1a2e1a] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right Action: Call, Email & Instagram Logo Buttons + Clean Search */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Call Support Button (Uses Support Phone from Admin Settings) */}
            <a
              href={`tel:${cleanPhone}`}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#faf8f4] hover:bg-[#1a2e1a] text-[#1a2e1a] hover:text-white border border-[#e8d5b7]/80 flex items-center justify-center transition-all cursor-pointer shadow-2xs group"
              title={`Call Customer Support: ${supportPhone}`}
              aria-label={`Call Customer Support: ${supportPhone}`}
            >
              <Phone size={14} className="group-hover:scale-110 transition-transform" />
            </a>

            {/* Email Contact (Gmail Logo Only) */}
            <a
              href={`mailto:${supportEmail}`}
              className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#faf8f4] hover:bg-[#f3ede2] border border-[#e8d5b7]/80 items-center justify-center transition-all cursor-pointer shadow-2xs group"
              title={`Email Us: ${supportEmail}`}
              aria-label={`Email Us: ${supportEmail}`}
            >
              <div className="relative w-4 h-4 sm:w-4.5 sm:h-4.5 flex-shrink-0">
                <Image
                  src="/images/gmail-logo.webp"
                  alt="Email"
                  fill
                  sizes="18px"
                  className="object-contain group-hover:scale-110 transition-transform"
                  unoptimized
                />
              </div>
            </a>

            {/* Instagram (Instagram Logo Only) */}
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#faf8f4] hover:bg-[#f3ede2] border border-[#e8d5b7]/80 items-center justify-center transition-all cursor-pointer shadow-2xs group"
              title={`Instagram: @${instagramHandle}`}
              aria-label={`Instagram: @${instagramHandle}`}
            >
              <div className="relative w-4 h-4 sm:w-4.5 sm:h-4.5 flex-shrink-0">
                <Image
                  src="/images/instagram-logo.webp"
                  alt="Instagram"
                  fill
                  sizes="18px"
                  className="object-contain group-hover:scale-110 transition-transform"
                  unoptimized
                />
              </div>
            </a>

            {/* Shopping Bag / Cart Trigger with Bounce & Glow Animation on Add */}
            <div className="relative">
              <a
                href="/cart"
                onClick={(e) => {
                  e.preventDefault()
                  openCart()
                }}
                className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 shadow-xs group ${
                  isBagAnimating
                    ? 'bg-[#25D366] text-white scale-125 ring-4 ring-[#c4a675] shadow-[0_0_22px_rgba(196,166,117,0.85)]'
                    : 'bg-[#1a2e1a] hover:bg-[#25D366] text-white'
                }`}
                title={`Shopping Bag (${totalItems} items)`}
                aria-label={`Shopping Bag (${totalItems} items)`}
              >
                <ShoppingBag
                  size={15}
                  className={`transition-all duration-300 ${
                    isBagAnimating
                      ? 'scale-125 text-white animate-bounce'
                      : 'group-hover:scale-110 text-[#f4efe6]'
                  }`}
                />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-xs border-2 border-white leading-none transition-all duration-300 ${
                      isBagAnimating
                        ? 'bg-[#c85a44] scale-125 animate-pulse'
                        : 'bg-[#c85a44]'
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </a>

              {/* Floating "Added!" Tooltip Pill */}
              {isBagAnimating && (
                <div className="absolute -bottom-8 right-0 whitespace-nowrap bg-[#1a2e1a] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg border border-[#c4a675] pointer-events-none z-50 flex items-center gap-1 animate-in fade-in zoom-in-90 duration-200">
                  <Check size={11} className="text-[#25D366]" />
                  <span>Added!</span>
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 bg-[#faf8f4] border border-[#e8d5b7]/70 rounded-full px-3.5 py-1.5 focus-within:border-[#1a2e1a] focus-within:bg-white transition-all shadow-xs ml-1">
              <Search
                size={15}
                className="text-[#8a7d6e] flex-shrink-0 cursor-pointer"
                onClick={handleSearchTrigger}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search t-shirts, jerseys, hoodies..."
                className="bg-transparent text-xs outline-none w-48 lg:w-64 text-[#1a1a1a] placeholder-[#8a7d6e]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[#8a7d6e] hover:text-[#1a1a1a] transition-colors p-0.5 cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#e8d5b7]/50 bg-white/98 backdrop-blur-md px-5 py-4 space-y-3">
            {/* Mobile Search */}
            <div className="flex items-center gap-2 bg-[#faf8f4] border border-[#e8d5b7]/70 rounded-full px-3.5 py-2 mb-3">
              <Search size={16} className="text-[#8a7d6e]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search designs..."
                className="bg-transparent text-xs outline-none w-full text-[#1a1a1a] placeholder-[#8a7d6e]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[#8a7d6e] hover:text-[#1a1a1a] transition-colors p-0.5 cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavLinkClick(link.label, e)}
                  className={`text-sm py-2 px-3 rounded-lg font-medium transition-colors cursor-pointer ${
                    link.isRed ? 'text-[#c85a44] font-semibold bg-[#c85a44]/5' : 'text-[#3d362e] hover:bg-[#faf8f4]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* View Shopping Bag Button in Mobile Drawer */}
            <a
              href="/cart"
              onClick={(e) => {
                e.preventDefault()
                setMobileOpen(false)
                openCart()
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1a2e1a] hover:bg-[#25D366] text-white text-xs font-bold transition-all flex items-center justify-between shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag size={15} className="text-[#e8d5b7]" />
                <span>Your Shopping Bag</span>
              </div>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </a>

            {/* Quick Contact & Social Logos Row (Call, Email, Instagram) */}
            <div className="pt-2 flex items-center justify-around gap-2 bg-[#faf6f0] border border-[#e8d5b7] rounded-2xl p-2.5">
              <a
                href={`tel:${cleanPhone}`}
                onClick={() => setMobileOpen(false)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white transition-colors"
                title={`Call ${supportPhone}`}
                aria-label={`Call ${supportPhone}`}
              >
                <div className="w-10 h-10 rounded-full bg-[#1a2e1a] text-white flex items-center justify-center shadow-xs">
                  <Phone size={16} />
                </div>
                <span className="text-[10px] font-semibold text-[#1a2e1a]">Call</span>
              </a>

              <a
                href={`mailto:${supportEmail}`}
                onClick={() => setMobileOpen(false)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white transition-colors"
                title={`Email: ${supportEmail}`}
                aria-label={`Email: ${supportEmail}`}
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#ded7cb] flex items-center justify-center shadow-xs">
                  <div className="relative w-5 h-5">
                    <Image
                      src="/images/gmail-logo.webp"
                      alt="Email"
                      fill
                      sizes="20px"
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-[#1a2e1a]">Email</span>
              </a>

              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white transition-colors"
                title={`Instagram: @${instagramHandle}`}
                aria-label={`Instagram: @${instagramHandle}`}
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#ded7cb] flex items-center justify-center shadow-xs">
                  <div className="relative w-5 h-5">
                    <Image
                      src="/images/instagram-logo.webp"
                      alt="Instagram"
                      fill
                      sizes="20px"
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-[#1a2e1a]">Instagram</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
