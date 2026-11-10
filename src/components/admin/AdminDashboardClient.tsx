'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useStore } from '@/context/StoreContext'
import {
  LayoutDashboard,
  ShoppingBag,
  Grid,
  MessageSquare,
  Home,
  Percent,
  MessageCircle,
  Settings,
  Star,
  Save,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Check,
  Search,
  ChevronDown,
  ShieldAlert,
  LucideIcon,
} from 'lucide-react'

// Lightweight inline skeleton for lazy-loaded admin modules
function AdminModuleSkeleton() {
  return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-6 w-48 bg-[#e8d5b7]/30 rounded-lg" />
      <div className="h-4 w-72 bg-[#e8d5b7]/20 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-[#e8d5b7]/15 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

// Code-split admin modules — only the active tab downloads its JS
const DashboardModule = dynamic(() => import('@/components/admin/modules/DashboardModule'), {
  loading: () => <AdminModuleSkeleton />,
})
const ProductsModule = dynamic(() => import('@/components/admin/modules/ProductsModule'), {
  loading: () => <AdminModuleSkeleton />,
})
const CategoriesModule = dynamic(() => import('@/components/admin/modules/CategoriesModule'), {
  loading: () => <AdminModuleSkeleton />,
})
const EnquiriesModule = dynamic(() => import('@/components/admin/modules/EnquiriesModule'), {
  loading: () => <AdminModuleSkeleton />,
})
const HomepageModule = dynamic(() => import('@/components/admin/modules/HomepageModule'), {
  loading: () => <AdminModuleSkeleton />,
})
const PromotionsModule = dynamic(() => import('@/components/admin/modules/PromotionsModule'), {
  loading: () => <AdminModuleSkeleton />,
})
const WhatsAppModule = dynamic(() => import('@/components/admin/modules/WhatsAppModule'), {
  loading: () => <AdminModuleSkeleton />,
})
const SettingsModule = dynamic(() => import('@/components/admin/modules/SettingsModule'), {
  loading: () => <AdminModuleSkeleton />,
})
const ReviewsModule = dynamic(() => import('@/components/admin/modules/ReviewsModule'), {
  loading: () => <AdminModuleSkeleton />,
})
import UnsavedChangesModal from '@/components/admin/UnsavedChangesModal'

type TabId =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'enquiries'
  | 'homepage'
  | 'promotions'
  | 'whatsapp'
  | 'settings'
  | 'reviews'

interface TabConfig {
  id: TabId
  label: string
  icon: LucideIcon
}

const TABS: TabConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: ShoppingBag },
  { id: 'categories', label: 'Categories', icon: Grid },
  { id: 'homepage', label: 'Homepage Editor', icon: Home },
  { id: 'promotions', label: 'Promotions & Sale', icon: Percent },
  { id: 'enquiries', label: 'Enquiries', icon: MessageSquare },
  { id: 'whatsapp', label: 'WhatsApp Manage', icon: MessageCircle },
  { id: 'reviews', label: 'Testimonials', icon: Star },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function AdminDashboardPage() {
  const router = useRouter()
  const {
    draft,
    isDirty,
    isSaving,
    isLoading,
    saveDraft,
    discardDraft,
  } = useStore()

  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [pendingTab, setPendingTab] = useState<TabId | null>(null)
  const [unsavedModalOpen, setUnsavedModalOpen] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [saveSuccessToast, setSaveSuccessToast] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const searchContainerRef = useRef<HTMLDivElement | null>(null)
  const activeTabRef = useRef<TabId>(activeTab)

  // Keep activeTabRef synchronized for non-stale popstate event handling
  useEffect(() => {
    activeTabRef.current = activeTab
  }, [activeTab])

  // Sub-navigation bridge states
  const [categoryFilterForProducts, setCategoryFilterForProducts] = useState<string | null>(null)
  const [openCreateProductOnMount, setOpenCreateProductOnMount] = useState(false)

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        setSearchFocused(true)
      } else if (e.key === 'Escape') {
        setSearchFocused(false)
        searchInputRef.current?.blur()
      }
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Live search filtering across products, categories, enquiries
  const searchNormalized = searchQuery.trim().toLowerCase()
  const searchProducts = searchNormalized
    ? (draft.products || []).filter(
        (p) =>
          p.name.toLowerCase().includes(searchNormalized) ||
          p.category.toLowerCase().includes(searchNormalized) ||
          p.badge?.toLowerCase().includes(searchNormalized)
      )
    : []

  const searchCategories = searchNormalized
    ? (draft.categories || []).filter(
        (c) =>
          c.title.toLowerCase().includes(searchNormalized) ||
          c.subtitle?.toLowerCase().includes(searchNormalized)
      )
    : []

  const searchEnquiries = searchNormalized
    ? (draft.enquiries || []).filter(
        (e) =>
          e.productName.toLowerCase().includes(searchNormalized) ||
          e.color.toLowerCase().includes(searchNormalized) ||
          e.customNotes?.toLowerCase().includes(searchNormalized)
      )
    : []

  const totalSearchResults =
    searchProducts.length + searchCategories.length + searchEnquiries.length

  // Auth gate check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = sessionStorage.getItem('varna_admin_session') === 'true'
      const isRemembered =
        localStorage.getItem('varna_remember_device') === 'true' &&
        Boolean(localStorage.getItem('varna_admin_token'))

      if (isRemembered && !isAuth) {
        // Auto-restore session for remembered device
        const token = localStorage.getItem('varna_admin_token') || ''
        sessionStorage.setItem('varna_admin_session', 'true')
        sessionStorage.setItem('varna_admin_token', token)
        setAuthenticated(true)
        document.cookie = `varna_admin_session=authenticated; path=/; max-age=31536000; SameSite=Lax`
        return
      }

      if (!isAuth) {
        router.replace('/admin/login')
      } else {
        setAuthenticated(true)
        // Ensure edge middleware cookie is set for multi-tab/device support
        if (!document.cookie.includes('varna_admin_session=authenticated')) {
          document.cookie = `varna_admin_session=authenticated; path=/; max-age=31536000; SameSite=Lax`
        }
      }
    }
  }, [router])

  // Prevent accidental browser tab close if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Browser history & back-button interception
  // 1. If back is clicked from ANY sub-section, show Dashboard.
  // 2. If back is clicked from Dashboard:
  //    - If device is remembered: show graceful Exit Warning modal.
  //    - If device is not remembered: navigate to login page.
  useEffect(() => {
    if (!authenticated || typeof window === 'undefined') return

    // Parse URL on initial load if user entered with ?tab=...
    const urlParams = new URLSearchParams(window.location.search)
    const initialTab = urlParams.get('tab') as TabId | null
    if (initialTab && TABS.some((t) => t.id === initialTab)) {
      setActiveTab(initialTab)
      window.history.replaceState({ tab: 'dashboard', guard: true }, '', '/admin')
      window.history.pushState({ tab: initialTab }, '', `/admin?tab=${initialTab}`)
    } else {
      window.history.replaceState({ tab: 'dashboard', guard: true }, '', '/admin')
      window.history.pushState({ tab: 'dashboard', guard: true }, '', '/admin')
    }

    const handlePopState = () => {
      const currentTab = activeTabRef.current
      const isRemembered = localStorage.getItem('varna_remember_device') === 'true'

      if (currentTab !== 'dashboard') {
        // Back clicked from any sub-tab (Products, Categories, Settings, etc.) -> Return to Dashboard
        setActiveTab('dashboard')
        setPendingTab(null)
        setUnsavedModalOpen(false)
        setMobileMenuOpen(false)
        window.history.replaceState({ tab: 'dashboard', guard: true }, '', '/admin')
        return
      }

      // If user is currently on Dashboard:
      if (isRemembered) {
        // Device is remembered: push guard back so we don't leave page, show graceful exit modal
        window.history.pushState({ tab: 'dashboard', guard: true }, '', '/admin')
        setShowExitModal(true)
      } else {
        // Device is not remembered: navigate back to login
        router.push('/admin/login')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [authenticated, router])

  // Centralized tab transition maintaining history stack
  const applyTabSwitch = (targetTab: TabId) => {
    setActiveTab(targetTab)
    setMobileMenuOpen(false)

    if (typeof window !== 'undefined') {
      if (targetTab === 'dashboard') {
        window.history.replaceState({ tab: 'dashboard', guard: true }, '', '/admin')
      } else {
        if (activeTabRef.current === 'dashboard') {
          window.history.pushState({ tab: targetTab }, '', `/admin?tab=${targetTab}`)
        } else {
          window.history.replaceState({ tab: targetTab }, '', `/admin?tab=${targetTab}`)
        }
      }
    }
  }

  // Tab switching with unsaved changes interception
  const handleTabClick = (targetTab: TabId) => {
    if (targetTab === activeTab) return
    setOpenCreateProductOnMount(false)
    setCategoryFilterForProducts(null)

    if (isDirty) {
      setPendingTab(targetTab)
      setUnsavedModalOpen(true)
    } else {
      applyTabSwitch(targetTab)
    }
  }

  const handleDiscardAndSwitch = () => {
    discardDraft()
    if (pendingTab) {
      applyTabSwitch(pendingTab)
      setPendingTab(null)
    }
    setUnsavedModalOpen(false)
    setMobileMenuOpen(false)
  }

  const handleSaveAndContinue = async () => {
    const success = await saveDraft()
    if (success) {
      showSavedToast()
      if (pendingTab) {
        applyTabSwitch(pendingTab)
        setPendingTab(null)
      }
      setUnsavedModalOpen(false)
      setMobileMenuOpen(false)
    }
  }

  const handleManualSave = async () => {
    const success = await saveDraft()
    if (success) {
      showSavedToast()
    }
  }

  const toastTimerRef = React.useRef<NodeJS.Timeout | null>(null)

  const showSavedToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setSaveSuccessToast(true)
    toastTimerRef.current = setTimeout(() => {
      setSaveSuccessToast(false)
    }, 3500)
  }

  const handleLogout = () => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Logging out will discard them. Continue?')) {
        return
      }
    }
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('varna_admin_session')
      sessionStorage.removeItem('varna_admin_token')
      localStorage.removeItem('varna_admin_authenticated')
      // Clear the edge middleware cookie
      document.cookie = 'varna_admin_session=; path=/; max-age=0; SameSite=Lax'
    }
    router.replace('/admin/login?logged_out=1')
  }

  // Cross-module bridge: Add Product from Category Tile
  const handleAddProductFromCategory = (categoryName: string) => {
    setCategoryFilterForProducts(categoryName)
    setOpenCreateProductOnMount(true)
    handleTabClick('products')
  }

  if (authenticated === null || isLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center text-[#142319]">
        <div className="w-12 h-12 border-3 border-[#1c3624] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold tracking-wider text-[#1c3624] uppercase">
          Loading Varna Admin...
        </p>
      </div>
    )
  }

  const currentTabConfig = TABS.find((t) => t.id === activeTab)
  const pendingEnquiriesCount = draft.enquiries?.filter((e) => !e.completed)?.length || 0

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#142319] flex">
      {/* Save Success Floating Notification Banner with Depleting Progress Bar & Dismiss */}
      {saveSuccessToast && (
        <div className="fixed top-5 right-5 z-[100] bg-[#1c3624] text-white border border-[#25D366]/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 w-80 max-w-[90vw]">
          <div className="p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center flex-shrink-0">
                <Check size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Changes Saved Live!</p>
                <p className="text-[10px] text-[#e8dccb] leading-tight">
                  Synchronized to MongoDB Atlas &amp; Cloudinary CDN
                </p>
              </div>
            </div>

            {/* Small Cross Icon to Dismiss */}
            <button
              type="button"
              onClick={() => {
                if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
                setSaveSuccessToast(false)
              }}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center cursor-pointer transition-colors flex-shrink-0"
              aria-label="Close notification"
            >
              <X size={13} />
            </button>
          </div>

          {/* Thin Depleting Progress Bar */}
          <div className="w-full h-1 bg-black/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#25D366] to-[#a3e9b8]"
              style={{
                animation: 'toastProgress 3.5s linear forwards',
              }}
            />
          </div>
          <style jsx>{`
            @keyframes toastProgress {
              from {
                width: 100%;
              }
              to {
                width: 0%;
              }
            }
          `}</style>
        </div>
      )}

      {/* Unsaved Changes Guard Dialog */}
      <UnsavedChangesModal
        isOpen={unsavedModalOpen}
        moduleName={currentTabConfig?.label || 'Module'}
        onStay={() => setUnsavedModalOpen(false)}
        onDiscard={handleDiscardAndSwitch}
        onSaveAndContinue={handleSaveAndContinue}
        isSaving={isSaving}
      />

      {/* Graceful Exit Warning Modal for Remembered Device */}
      {showExitModal && (
        <div
          onClick={() => setShowExitModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#faf8f5] border border-[#e8d5b7] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#1c3624]/10 text-[#1c3624] flex items-center justify-center mb-4 border border-[#1c3624]/15">
                <ShieldAlert size={28} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#142319] tracking-tight">
                Exit Admin Panel?
              </h3>
              <p className="text-xs text-[#6b7770] mt-2 leading-relaxed">
                You are on the dashboard with <strong>Remember Me</strong> active on this device.
                Leaving will keep your session saved. How would you like to proceed?
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="w-full py-3 px-4 rounded-xl bg-[#1c3624] text-[#faf8f5] font-bold text-xs uppercase tracking-wider hover:bg-[#142319] transition-all cursor-pointer shadow-xs"
              >
                Stay in Admin Panel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false)
                  router.push('/')
                }}
                className="w-full py-3 px-4 rounded-xl bg-white border border-[#ded7cb] text-[#142319] font-bold text-xs uppercase tracking-wider hover:bg-[#faf6f0] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} className="text-[#845d1d]" />
                <span>Return to Storefront</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitModal(false)
                  handleLogout()
                }}
                className="w-full py-2.5 px-4 rounded-xl text-[#b84840] hover:bg-red-50 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut size={14} />
                <span>Log Out of Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Backdrop for Sidebar */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-35 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* SIDEBAR (Desktop & Mobile Drawer) - Deep Forest Green Luxury */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-40 w-64 h-screen bg-[#0f1d14] text-[#a0b4a4] flex flex-col justify-between transition-transform duration-300 ease-in-out shrink-0 select-none overflow-hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Subtle Decorative Botanical Leaf Background Accents */}
        <div className="absolute top-0 left-0 pointer-events-none opacity-20">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <path
              d="M0,0 Q60,20 80,80 Q20,60 0,0 Z"
              fill="#c8d8cc"
            />
            <path
              d="M10,0 Q70,40 60,110 Q20,70 10,0 Z"
              fill="#c8d8cc"
              opacity="0.6"
            />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 pointer-events-none opacity-15">
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            <path
              d="M0,140 Q40,80 110,60 Q70,120 0,140 Z"
              fill="#c8d8cc"
            />
          </svg>
        </div>

        {/* Top Brand Header */}
        <div className="p-5 pb-4 relative z-10 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-10 aspect-[831/469] flex-shrink-0">
                <Image
                  src="https://res.cloudinary.com/o6jv6xte/image/upload/v1793872123/varna_store/logo/varna-brandmark-transparent-gold-v3.webp"
                  alt="Varna"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold tracking-tight text-white leading-tight">
                  Varna
                </h1>
                <p className="text-[10px] font-medium text-[#9eb3a2] tracking-wide">
                  Admin Panel
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-[#9eb3a2] hover:text-white p-1 rounded-lg"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs List */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto no-scrollbar relative z-10 py-2">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isEnquiries = tab.id === 'enquiries'
            const count = isEnquiries ? pendingEnquiriesCount : 0

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#ede2d1] text-[#13251a] shadow-xs font-bold'
                    : 'text-[#9eb3a2] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={isActive ? 'text-[#13251a]' : 'text-[#8ea392]'}
                  />
                  <span>{tab.label}</span>
                </div>

                {isEnquiries && count > 0 && (
                  <span className="text-[10px] font-bold bg-[#e34b46] text-white px-2 py-0.5 rounded-full shadow-2xs">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom Actions: View Website & Session */}
        <div className="p-4 border-t border-white/10 relative z-10 space-y-3">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3.5 rounded-xl bg-[#183220] hover:bg-[#203f2a] text-[#f2ebe2] border border-[#2b4c34] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>View Website</span>
            <ExternalLink size={13} className="text-[#9eb3a2]" />
          </Link>

          <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-[#8ea392]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Online</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="text-[#9eb3a2] hover:text-red-300 transition-colors p-1"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN AREA (Header + Content) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header - Warm Clean White Bar */}
        <header className="h-16 bg-white border-b border-[#ece6dc] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          {/* Left: Mobile Hamburger & Search Input */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#2c3830] hover:bg-[#f2eee7] cursor-pointer"
              aria-label="Toggle Menu"
            >
              <Menu size={20} />
            </button>

            {/* Interactive Admin Search Bar with Results Dropdown */}
            <div ref={searchContainerRef} className="relative w-full hidden sm:block">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b948d] pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSearchFocused(true)
                }}
                placeholder="Search products, categories, enquiries..."
                className="w-full bg-white border border-[#e4ded3] rounded-xl pl-9 pr-20 py-1.5 text-xs text-[#142319] placeholder-[#8b948d] focus:outline-hidden focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624]"
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      searchInputRef.current?.focus()
                    }}
                    className="p-1 rounded-md text-[#8b948d] hover:text-[#142319] hover:bg-[#ece6dc] cursor-pointer"
                    title="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
                <span className="text-[10px] font-mono text-[#8b948d] bg-[#f2eee7] border border-[#e4ded3] px-1.5 py-0.5 rounded-md pointer-events-none">
                  Ctrl + K
                </span>
              </div>

              {/* Search Results Dropdown Overlay */}
              {searchFocused && searchQuery.trim() && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#ded7cb] rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3 bg-[#faf7f2] border-b border-[#ded7cb] flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#142319] uppercase tracking-wider font-mono">
                      Search Results ({totalSearchResults})
                    </span>
                    <span className="text-[10px] text-[#6b7770]">ESC to close</span>
                  </div>

                  {totalSearchResults === 0 ? (
                    <div className="p-6 text-center text-xs text-[#6b7770]">
                      No products, categories, or customer leads match &ldquo;{searchQuery}&rdquo;
                    </div>
                  ) : (
                    <div className="divide-y divide-[#f0ece4]">
                      {/* Matching Products */}
                      {searchProducts.length > 0 && (
                        <div className="p-2">
                          <span className="text-[10px] font-bold uppercase text-[#845d1d] px-2 py-1 block">
                            Products ({searchProducts.length})
                          </span>
                          <div className="space-y-1">
                            {searchProducts.slice(0, 4).map((p) => {
                              const thumb = p.colors?.[0]?.image || '/placeholder.png'
                              const effPrice =
                                p.hasColorPricing && p.colors?.[0]?.price
                                  ? p.colors[0].price
                                  : p.price || p.colors?.[0]?.price || 0
                              return (
                                <div
                                  key={p.id}
                                  onClick={() => {
                                    setCategoryFilterForProducts(p.category)
                                    setSearchFocused(false)
                                    setSearchQuery('')
                                    handleTabClick('products')
                                  }}
                                  className="flex items-center justify-between p-2 rounded-xl hover:bg-[#faf6f0] cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="relative w-8 h-10 rounded-lg overflow-hidden bg-[#faf5ee] border border-[#ded7cb] shrink-0">
                                      <Image
                                        src={thumb}
                                        alt={p.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                      />
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-[#142319] leading-tight">
                                        {p.name}
                                      </p>
                                      <p className="text-[10px] text-[#6b7770]">
                                        {p.category} • ₹{effPrice.toLocaleString('en-IN')}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-[#1c3624] font-semibold bg-[#eaf6ec] px-2 py-0.5 rounded-full">
                                    View
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Matching Categories */}
                      {searchCategories.length > 0 && (
                        <div className="p-2">
                          <span className="text-[10px] font-bold uppercase text-[#845d1d] px-2 py-1 block">
                            Categories ({searchCategories.length})
                          </span>
                          <div className="space-y-1">
                            {searchCategories.map((c) => (
                              <div
                                key={c.id}
                                onClick={() => {
                                  setSearchFocused(false)
                                  setSearchQuery('')
                                  handleTabClick('categories')
                                }}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#faf6f0] cursor-pointer transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-[#faf5ee] border border-[#ded7cb] shrink-0">
                                    <Image
                                      src={c.image}
                                      alt={c.title}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-[#142319] leading-tight">
                                      {c.title}
                                    </p>
                                    <p className="text-[10px] text-[#6b7770]">
                                      {c.subtitle || c.link}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] text-[#845d1d] font-semibold bg-[#fcf5e9] px-2 py-0.5 rounded-full">
                                  Category
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Matching Enquiries */}
                      {searchEnquiries.length > 0 && (
                        <div className="p-2">
                          <span className="text-[10px] font-bold uppercase text-[#845d1d] px-2 py-1 block">
                            Enquiries &amp; Leads ({searchEnquiries.length})
                          </span>
                          <div className="space-y-1">
                            {searchEnquiries.slice(0, 4).map((e) => (
                              <div
                                key={e.id}
                                onClick={() => {
                                  setSearchFocused(false)
                                  setSearchQuery('')
                                  handleTabClick('enquiries')
                                }}
                                className="flex items-center justify-between p-2 rounded-xl hover:bg-[#faf6f0] cursor-pointer transition-colors"
                              >
                                <div>
                                  <p className="text-xs font-bold text-[#142319] leading-tight">
                                    {e.productName}
                                  </p>
                                  <p className="text-[10px] text-[#6b7770]">
                                    {e.color} • {e.size} • {e.timestamp}
                                  </p>
                                </div>
                                <span className="text-[10px] text-[#b84840] font-semibold bg-[#fdf0ef] px-2 py-0.5 rounded-full">
                                  Lead
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions, Status & Admin Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Dirty Changes Staging Status Badge */}
            {isDirty ? (
              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Unsaved Draft</span>
              </span>
            ) : (
              <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Live Synced</span>
              </span>
            )}

            {/* Master Save Changes Button (Dark Forest Green Pill) */}
            <button
              type="button"
              onClick={handleManualSave}
              disabled={!isDirty || isSaving}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                isDirty
                  ? 'bg-[#1c3624] hover:bg-[#152a1c] text-white shadow-md animate-pulse'
                  : 'bg-[#e8e4dc] text-[#8e897e] cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={14} />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>

            {/* User Profile Avatar matching screenshot */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-[#e8e4dc]">
              <div className="w-8 h-8 rounded-full bg-[#1c3624] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                V
              </div>
              <div className="hidden sm:block text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[#142319] leading-tight">
                    Varna Admin
                  </span>
                  <ChevronDown size={13} className="text-[#8b948d]" />
                </div>
                <span className="text-[10px] text-[#78857c] block leading-tight">
                  Super Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Body Canvas (Warm, Bright, Airy, Luxurious) */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              <DashboardModule
                onNavigateTab={(tab) => handleTabClick(tab as TabId)}
                onQuickAddProduct={() => {
                  setCategoryFilterForProducts(null)
                  setOpenCreateProductOnMount(true)
                  handleTabClick('products')
                }}
              />
            )}

            {activeTab === 'products' && (
              <ProductsModule
                initialCategoryFilter={categoryFilterForProducts}
                openCreateOnMount={openCreateProductOnMount}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesModule onAddProductForCategory={handleAddProductFromCategory} />
            )}

            {activeTab === 'enquiries' && <EnquiriesModule />}

            {activeTab === 'homepage' && <HomepageModule />}

            {activeTab === 'promotions' && <PromotionsModule />}

            {activeTab === 'whatsapp' && <WhatsAppModule />}

            {activeTab === 'settings' && <SettingsModule />}

            {activeTab === 'reviews' && <ReviewsModule />}
          </div>
        </main>
      </div>
    </div>
  )
}
