'use client'
import React from 'react'
import Image from 'next/image'
import { useStore } from '@/context/StoreContext'
import {
  Package,
  Tag,
  MessageCircle,
  Percent,
  Plus,
  Image as ImageIcon,
  Layers,
  Edit3,
  Settings,
  ArrowRight,
  Phone,
  Star,
  Clock,
} from 'lucide-react'

interface DashboardModuleProps {
  onNavigateTab: (tabId: string) => void
  onQuickAddProduct?: () => void
}

const ADMIN_HERO_BANNER_URL =
  'https://res.cloudinary.com/o6jv6xte/image/upload/v1793550476/varna_store/admin/admin-banner-hero.webp'

export default function DashboardModule({
  onNavigateTab,
  onQuickAddProduct,
}: DashboardModuleProps) {
  const { draft, updateDraft } = useStore()

  const products = draft.products || []
  const productsCount = products.length
  const categories = draft.categories || []
  const categoriesCount = categories.filter((c) => c.visible).length || categories.length
  const activePromotions = draft.promotions?.filter((p) => p.active) || []
  const activeOffersCount = activePromotions.length
  const enquiries = draft.enquiries || []
  const pendingEnquiriesCount = enquiries.filter((e) => !e.completed).length

  const waPhone = draft.whatsapp?.phoneNumber || '916363145972'
  const reviewsRating = draft.reviews?.averageRating || 4.6
  const reviewsCount = draft.reviews?.totalReviewsCount || 120

  // Toggle enquiry completion directly from dashboard
  const handleToggleEnquiry = (id: string) => {
    updateDraft((prev) => ({
      ...prev,
      enquiries: (prev.enquiries || []).map((e) =>
        e.id === id ? { ...e, completed: !e.completed } : e
      ),
    }))
  }

  return (
    <div className="space-y-6">
      {/* 1. WELCOME HERO BANNER (Cloudinary Editorial Models Photo) */}
      <div className="bg-gradient-to-r from-[#fbf8f3] via-[#f7f0e6] to-[#efe5d5] border border-[#e8ded2] rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        {/* Left: Text & Badges */}
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 mb-2.5">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#845d1d] font-mono bg-white/80 px-2.5 py-0.5 rounded-full border border-[#e2d8cb]">
              Varna Executive Suite
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#206035] bg-[#eef7f0] px-2.5 py-0.5 rounded-full border border-[#d6ecda]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#206035] animate-pulse" />
              <span>Live Synced</span>
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#142319] tracking-tight flex items-center gap-2">
            <span>Welcome back, Varna Admin</span>
            <span className="text-2xl sm:text-3xl">👋</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#5a665d] mt-2 leading-relaxed font-normal">
            Manage your store, products, content and customer enquiries — all in one place.
          </p>
        </div>

        {/* Right: High-Res Editorial Campaign Frame */}
        <div className="relative shrink-0 w-full md:w-80 lg:w-96 h-48 sm:h-56 rounded-2xl overflow-hidden border border-[#ded4c6] shadow-md bg-[#faf5ee]">
          <Image
            src={ADMIN_HERO_BANNER_URL}
            alt="Varna Editorial Campaign Banner"
            fill
            sizes="(max-width: 768px) 100vw, 384px"
            className="object-cover object-center hover:scale-105 transition-transform duration-500"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          <span className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
            Varna Editorial Drop
          </span>
        </div>
      </div>

      {/* 2. REAL METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Products */}
        <div
          onClick={() => onNavigateTab('products')}
          className="bg-[#eef7f0] border border-[#d6ecda] rounded-3xl p-5 sm:p-6 transition-all hover:shadow-xs hover:border-[#b8e0bf] cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#d7eedc] text-[#206035] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Package size={22} />
            </div>
            <span className="text-[11px] font-bold text-[#206035] bg-white/70 px-2 py-0.5 rounded-full border border-[#d6ecda]">
              Live Catalog
            </span>
          </div>

          <div className="mt-4">
            <span className="text-xs font-semibold text-[#526a57] block">Total Products</span>
            <span className="font-display text-3xl sm:text-4xl font-bold text-[#142319] tracking-tight block mt-0.5">
              {productsCount}
            </span>
            <span className="text-[11px] text-[#526a57] mt-1 block">
              {products[0]?.category || 'Active items in inventory'}
            </span>
          </div>
        </div>

        {/* Card 2: Categories */}
        <div
          onClick={() => onNavigateTab('categories')}
          className="bg-[#fcf5e9] border border-[#f4e4cb] rounded-3xl p-5 sm:p-6 transition-all hover:shadow-xs hover:border-[#ebd5b2] cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#f7e6c8] text-[#845d1d] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Tag size={22} />
            </div>
            <span className="text-[11px] font-bold text-[#845d1d] bg-white/70 px-2 py-0.5 rounded-full border border-[#f4e4cb]">
              Homepage Tiles
            </span>
          </div>

          <div className="mt-4">
            <span className="text-xs font-semibold text-[#796749] block">Categories</span>
            <span className="font-display text-3xl sm:text-4xl font-bold text-[#142319] tracking-tight block mt-0.5">
              {categoriesCount}
            </span>
            <span className="text-[11px] text-[#796749] mt-1 block">
              Active collection grids
            </span>
          </div>
        </div>

        {/* Card 3: New Enquiries */}
        <div
          onClick={() => onNavigateTab('enquiries')}
          className="bg-[#fdf0ef] border border-[#fcd8d5] rounded-3xl p-5 sm:p-6 transition-all hover:shadow-xs hover:border-[#f9beba] cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#fad9d6] text-[#b84840] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <MessageCircle size={22} />
            </div>
            <span className="text-[11px] font-bold text-[#b84840] bg-white/70 px-2 py-0.5 rounded-full border border-[#fcd8d5]">
              {pendingEnquiriesCount} Pending
            </span>
          </div>

          <div className="mt-4">
            <span className="text-xs font-semibold text-[#7e5855] block">Orders &amp; Enquiries</span>
            <span className="font-display text-3xl sm:text-4xl font-bold text-[#142319] tracking-tight block mt-0.5">
              {enquiries.length}
            </span>
            <span className="text-[11px] text-[#7e5855] mt-1 block">
              Cart checkout &amp; direct leads
            </span>
          </div>
        </div>

        {/* Card 4: Active Offers */}
        <div
          onClick={() => onNavigateTab('promotions')}
          className="bg-[#f3f0fc] border border-[#e4dcf8] rounded-3xl p-5 sm:p-6 transition-all hover:shadow-xs hover:border-[#d2c2f3] cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-2xl bg-[#e5dcf8] text-[#6346aa] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <Percent size={22} />
            </div>
            <span className="text-[11px] font-bold text-[#6346aa] bg-white/70 px-2 py-0.5 rounded-full border border-[#e4dcf8]">
              Flash Drops
            </span>
          </div>

          <div className="mt-4">
            <span className="text-xs font-semibold text-[#64597b] block">Active Offers</span>
            <span className="font-display text-3xl sm:text-4xl font-bold text-[#142319] tracking-tight block mt-0.5">
              {activeOffersCount}
            </span>
            <span className="text-[11px] text-[#64597b] mt-1 block truncate">
              {activePromotions[0]?.title || 'No active promos'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. PRODUCTION OPERATIONS: QUICK ACTIONS & SYSTEM INFRASTRUCTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Quick Actions (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-[#ebe5da] rounded-3xl p-6 sm:p-7 shadow-2xs flex flex-col">
          <div className="mb-5">
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#142319]">
              Quick Store Actions
            </h2>
            <p className="text-xs text-[#6b7770]">
              Frequent administrative actions and storefront management tools
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {/* Button 1: Add Product (Dark Forest Green Primary) */}
            <button
              type="button"
              onClick={() => {
                if (onQuickAddProduct) onQuickAddProduct()
              }}
              className="py-4 px-3 rounded-2xl bg-[#1c3624] hover:bg-[#14281a] text-white flex flex-col items-center justify-center gap-2 shadow-xs transition-all active:scale-97 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
              </div>
              <span className="text-xs font-bold text-center">Add Product</span>
            </button>

            {/* Button 2: Update Banner */}
            <button
              type="button"
              onClick={() => onNavigateTab('homepage')}
              className="py-4 px-3 rounded-2xl bg-[#faf5ee] hover:bg-[#f2ece2] border border-[#e8ded3] text-[#142319] flex flex-col items-center justify-center gap-2 transition-all active:scale-97 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-[#ded7cb] flex items-center justify-center">
                <ImageIcon size={18} className="text-[#3d4941]" />
              </div>
              <span className="text-xs font-semibold text-center">Update Banner</span>
            </button>

            {/* Button 3: Create Offer */}
            <button
              type="button"
              onClick={() => onNavigateTab('promotions')}
              className="py-4 px-3 rounded-2xl bg-[#faf5ee] hover:bg-[#f2ece2] border border-[#e8ded3] text-[#142319] flex flex-col items-center justify-center gap-2 transition-all active:scale-97 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-[#ded7cb] flex items-center justify-center">
                <Percent size={18} className="text-[#3d4941]" />
              </div>
              <span className="text-xs font-semibold text-center">Create Offer</span>
            </button>

            {/* Button 4: Manage Categories */}
            <button
              type="button"
              onClick={() => onNavigateTab('categories')}
              className="py-4 px-3 rounded-2xl bg-[#faf5ee] hover:bg-[#f2ece2] border border-[#e8ded3] text-[#142319] flex flex-col items-center justify-center gap-2 transition-all active:scale-97 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-[#ded7cb] flex items-center justify-center">
                <Layers size={18} className="text-[#3d4941]" />
              </div>
              <span className="text-xs font-semibold text-center">Categories</span>
            </button>

            {/* Button 5: Edit Homepage */}
            <button
              type="button"
              onClick={() => onNavigateTab('homepage')}
              className="py-4 px-3 rounded-2xl bg-[#faf5ee] hover:bg-[#f2ece2] border border-[#e8ded3] text-[#142319] flex flex-col items-center justify-center gap-2 transition-all active:scale-97 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-[#ded7cb] flex items-center justify-center">
                <Edit3 size={18} className="text-[#3d4941]" />
              </div>
              <span className="text-xs font-semibold text-center">Edit Homepage</span>
            </button>

            {/* Button 6: Store Settings */}
            <button
              type="button"
              onClick={() => onNavigateTab('settings')}
              className="py-4 px-3 rounded-2xl bg-[#faf5ee] hover:bg-[#f2ece2] border border-[#e8ded3] text-[#142319] flex flex-col items-center justify-center gap-2 transition-all active:scale-97 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-[#ded7cb] flex items-center justify-center">
                <Settings size={18} className="text-[#3d4941]" />
              </div>
              <span className="text-xs font-semibold text-center">Store Settings</span>
            </button>
          </div>
        </div>

        {/* Live System & Channel Pipeline Status (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-[#ebe5da] rounded-3xl p-6 sm:p-7 shadow-2xs flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#142319]">
              Storefront Channels &amp; Health
            </h2>
            <p className="text-xs text-[#6b7770]">
              Active customer touchpoints and live storefront status
            </p>
          </div>

          <div className="space-y-3">
            {/* Item 1: WhatsApp Concierge */}
            <div
              onClick={() => onNavigateTab('whatsapp')}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#faf8f5] hover:bg-[#f3ede3] transition-colors border border-[#ded7cb] cursor-pointer"
              title="Click to manage WhatsApp Concierge"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 text-[#206035] flex items-center justify-center">
                  <Phone size={17} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#142319] block">WhatsApp Concierge</span>
                  <span className="text-[10px] text-[#6b7770] font-mono">+{waPhone}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#206035] bg-[#eaf6ec] border border-[#cbe8d1] px-2.5 py-0.5 rounded-full">
                Active
              </span>
            </div>

            {/* Item 2: Active Promotions & Offers */}
            <div
              onClick={() => onNavigateTab('promotions')}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#faf8f5] hover:bg-[#f3ede3] transition-colors border border-[#ded7cb] cursor-pointer"
              title="Click to view promotions"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#c85a44]/15 text-[#c85a44] flex items-center justify-center">
                  <Percent size={17} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#142319] block">Active Offers &amp; Sale</span>
                  <span className="text-[10px] text-[#6b7770]">
                    {activeOffersCount > 0
                      ? `${activeOffersCount} campaign${activeOffersCount === 1 ? '' : 's'} live on storefront`
                      : 'No active sales currently running'}
                  </span>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  activeOffersCount > 0
                    ? 'text-[#206035] bg-[#eaf6ec] border-[#cbe8d1]'
                    : 'text-[#8c978f] bg-[#f0eae1] border-[#ded7cb]'
                }`}
              >
                {activeOffersCount > 0 ? 'Live' : 'Inactive'}
              </span>
            </div>

            {/* Item 3: Live Catalog Status */}
            <div
              onClick={() => onNavigateTab('products')}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#faf8f5] hover:bg-[#f3ede3] transition-colors border border-[#ded7cb] cursor-pointer"
              title="Click to manage catalog"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1c3624]/10 text-[#1c3624] flex items-center justify-center">
                  <Layers size={17} />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#142319] block">Live Catalog Status</span>
                  <span className="text-[10px] text-[#6b7770]">
                    {productsCount} Product{productsCount === 1 ? '' : 's'} • {categoriesCount} Categories
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#206035] bg-[#eaf6ec] border border-[#cbe8d1] px-2.5 py-0.5 rounded-full">
                Published
              </span>
            </div>

            {/* Item 4: Customer Sentiment / Reviews */}
            <div
              onClick={() => onNavigateTab('reviews')}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#faf8f5] hover:bg-[#f3ede3] transition-colors border border-[#ded7cb] cursor-pointer"
              title="Click to view testimonials"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                  <Star size={17} className="fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#142319] block">Storefront Social Proof</span>
                  <span className="text-[10px] text-[#6b7770]">
                    {reviewsRating} ★ Score • {reviewsCount}+ Verified Orders
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#845d1d] bg-[#fcf5e9] border border-[#f4e4cb] px-2.5 py-0.5 rounded-full">
                Trusted
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY: RECENT ENQUIRIES & CATALOG PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Recent Enquiries Card */}
        <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 sm:p-7 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#142319]">
                  Recent Orders &amp; Enquiries
                </h2>
                <p className="text-xs text-[#6b7770]">
                  Customer orders and WhatsApp checkout requests
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('enquiries')}
                className="text-xs font-bold text-[#142319] hover:text-[#1c3624] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View All ({enquiries.length})</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {enquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6b7770] bg-[#faf8f5] rounded-2xl border border-[#ded7cb]">
                No customer orders or enquiries logged yet.
              </div>
            ) : (
              <div className="space-y-3">
                {enquiries.slice(0, 4).map((enq) => (
                  <div
                    key={enq.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#faf8f5] border border-[#ded7cb] hover:bg-[#f6f2ec] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-[#ded7cb] text-[#142319] font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {(enq.customerName || enq.productName).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-bold text-[#142319] leading-tight">
                            {enq.customerName || enq.productName}
                          </h3>
                          {enq.totalAmount && (
                            <span className="text-[11px] font-bold text-[#1c3624]">
                              ₹{enq.totalAmount.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#556358] mt-0.5 leading-tight">
                          {enq.customerName ? `${enq.productName} • ` : ''}
                          {enq.color !== 'N/A' && `${enq.color} • `}
                          {enq.size !== 'N/A' && `${enq.size} `}
                          (Qty: {enq.quantity})
                        </p>
                        {enq.address?.city && (
                          <span className="text-[10px] text-[#845d1d] block mt-0.5">
                            📍 {enq.address.city}, {enq.address.state}
                          </span>
                        )}
                        {enq.customNotes && !enq.address && (
                          <span className="text-[10px] text-[#845d1d] block mt-0.5 truncate max-w-xs">
                            Note: &ldquo;{enq.customNotes}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] text-[#8c978f] flex items-center gap-1">
                        <Clock size={10} />
                        <span>{enq.timestamp}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleEnquiry(enq.id)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer border ${
                          enq.completed
                            ? 'bg-[#eaf6ec] text-[#246b38] border-[#cbe8d1]'
                            : enq.status === 'Paid'
                            ? 'bg-[#eaf6ec] text-[#246b38] border-[#cbe8d1]'
                            : enq.status === 'Dispatched'
                            ? 'bg-[#e8f2fc] text-[#1c65b9] border-[#c4ddf8]'
                            : 'bg-[#fef6e7] text-[#975a16] border-[#fae4ba]'
                        }`}
                        title="Click to toggle status"
                      >
                        {enq.completed ? '✓ Completed' : enq.status ? `● ${enq.status}` : '● Active Lead'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Catalog Products Card (With Clean Product Thumbnails & Direct Navigation) */}
        <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 sm:p-7 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-[#142319]">
                  Catalog Products
                </h2>
                <p className="text-xs text-[#6b7770]">
                  Live inventory available to customers on the storefront
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('products')}
                className="text-xs font-bold text-[#142319] hover:text-[#1c3624] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Manage Catalog ({productsCount})</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {products.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6b7770] bg-[#faf8f5] rounded-2xl border border-[#ded7cb]">
                No products in catalog. Click &ldquo;Add Product&rdquo; above.
              </div>
            ) : (
              <div className="space-y-3">
                {products.slice(0, 4).map((p) => {
                  const thumbnailColor = p.colors?.[0]
                  const effectivePrice =
                    p.hasColorPricing && thumbnailColor?.price
                      ? thumbnailColor.price
                      : p.price > 0
                      ? p.price
                      : thumbnailColor?.price || 0

                  const effectiveOriginalPrice =
                    p.hasColorPricing && thumbnailColor?.originalPrice
                      ? thumbnailColor.originalPrice
                      : p.originalPrice > 0
                      ? p.originalPrice
                      : thumbnailColor?.originalPrice || effectivePrice

                  const primaryImage =
                    thumbnailColor?.image ||
                    'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532655/varna_store/products/linen-shirt-terracotta.webp'

                  return (
                    <div
                      key={p.id}
                      onClick={() => onNavigateTab('products')}
                      className="group cursor-pointer flex items-center justify-between p-3 rounded-2xl bg-[#faf8f5] border border-[#ded7cb] hover:border-[#1c3624] hover:bg-[#f6f2ec] transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Prominent Product Thumbnail */}
                        <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-white border border-[#ded7cb] shrink-0">
                          <Image
                            src={primaryImage}
                            alt={p.name}
                            fill
                            className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-[#142319] leading-tight truncate">
                            {p.name}
                          </h3>
                          <p className="text-[11px] text-[#556358] mt-0.5 leading-tight">
                            {p.category} • {p.gender || 'Unisex'} • {p.colors.length} color{p.colors.length === 1 ? '' : 's'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-bold text-[#142319]">
                              ₹{effectivePrice.toLocaleString('en-IN')}
                            </span>
                            {effectiveOriginalPrice > effectivePrice && (
                              <span className="text-[10px] text-[#8c978f] line-through">
                                ₹{effectiveOriginalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                        <span className="text-[9px] font-bold text-[#246b38] bg-[#eaf6ec] border border-[#cbe8d1] px-2 py-0.5 rounded-full">
                          Published
                        </span>
                        {p.badge && p.badge !== 'None' && (
                          <span className="text-[9px] font-bold text-[#845d1d] bg-[#fcf5e9] border border-[#f4e4cb] px-2 py-0.5 rounded-full">
                            {p.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
