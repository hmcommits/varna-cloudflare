'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { useStore } from '@/context/StoreContext'
import { Promotion } from '@/types/store'
import { Plus, Trash2, Edit2, X } from 'lucide-react'

export default function PromotionsModule() {
  const { draft, updateDraft } = useStore()
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const promotions = draft.promotions || []
  const catalogProducts = draft.products || []

  function createEmptyPromotion(): Promotion {
    return {
      id: `promo-${Date.now()}`,
      title: 'End of Season Flash Sale',
      discountText: 'UP TO 50% OFF',
      code: 'FLASH50',
      active: true,
      saleProducts: catalogProducts.slice(0, 2).map((p) => ({
        productId: p.id,
        salePrice: Math.round(p.price * 0.8),
      })),
    }
  }

  const handleSavePromo = () => {
    if (!editingPromo) return
    if (!editingPromo.title.trim()) {
      alert('Please enter a promotion title.')
      return
    }

    updateDraft((prev) => {
      const list = prev.promotions || []
      const idx = list.findIndex((p) => p.id === editingPromo.id)
      if (idx >= 0) {
        const nextList = [...list]
        nextList[idx] = editingPromo
        return { ...prev, promotions: nextList }
      } else {
        return { ...prev, promotions: [editingPromo, ...list] }
      }
    })

    setEditingPromo(null)
    setIsCreating(false)
  }

  const handleDeletePromo = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      updateDraft((prev) => ({
        ...prev,
        promotions: (prev.promotions || []).filter((p) => p.id !== id),
      }))
    }
  }

  const handleToggleActive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    updateDraft((prev) => ({
      ...prev,
      promotions: (prev.promotions || []).map((p) =>
        p.id === id ? { ...p, active: !p.active } : p
      ),
    }))
  }

  // Toggle a product inclusion in this sale
  const handleToggleSaleProduct = (productId: string, regularPrice: number) => {
    if (!editingPromo) return
    const currentList = editingPromo.saleProducts || []
    const exists = currentList.find((sp) => sp.productId === productId)

    if (exists) {
      setEditingPromo({
        ...editingPromo,
        saleProducts: currentList.filter((sp) => sp.productId !== productId),
      })
    } else {
      setEditingPromo({
        ...editingPromo,
        saleProducts: [
          ...currentList,
          {
            productId,
            salePrice: Math.round(regularPrice * 0.8),
          },
        ],
      })
    }
  }

  // Update sale price for a product
  const handleUpdateSalePrice = (productId: string, priceStr: string) => {
    if (!editingPromo) return
    const newPrice = Math.max(0, parseInt(priceStr, 10) || 0)
    const currentList = editingPromo.saleProducts || []

    setEditingPromo({
      ...editingPromo,
      saleProducts: currentList.map((sp) =>
        sp.productId === productId ? { ...sp, salePrice: newPrice } : sp
      ),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#ebe5da] rounded-3xl p-6 shadow-2xs">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#845d1d] font-mono">
            OFFERS &amp; FLASH DROPS
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#142319] mt-0.5">
            Storewide Sale &amp; Promotions Engine
          </h2>
          <p className="text-xs text-[#6b7770] mt-0.5">
            Configure flash drops and curate sale products with special discounts displayed directly in the storefront #sale section
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => {
              setEditingPromo(createEmptyPromotion())
              setIsCreating(true)
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-xs shadow-xs transition-all active:scale-97 cursor-pointer"
          >
            <Plus size={14} />
            <span>+ Create Sale Promotion</span>
          </button>
        </div>
      </div>

      {/* Promotions Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {promotions.length === 0 ? (
          <div className="md:col-span-2 bg-white border border-[#ebe5da] rounded-3xl p-8 text-center text-xs text-[#6b7770] shadow-2xs">
            No sale promotions active. Click &ldquo;+ Create Sale Promotion&rdquo; above to launch a sale drop!
          </div>
        ) : (
          promotions.map((promo) => {
            const saleProductsCount = promo.saleProducts?.length || 0
            const promoProductThumbs = (promo.saleProducts || [])
              .map((sp) => {
                const prod = catalogProducts.find((p) => p.id === sp.productId)
                return prod?.colors?.[0]?.image
              })
              .filter(Boolean) as string[]

            return (
              <div
                key={promo.id}
                onClick={() => {
                  setEditingPromo(promo)
                  setIsCreating(false)
                }}
                className={`bg-white border rounded-3xl p-6 flex flex-col justify-between transition-all shadow-2xs cursor-pointer group ${
                  promo.active
                    ? 'border-[#cbe8d1] bg-gradient-to-br from-white to-[#f7fbf8] hover:border-[#1c3624] hover:shadow-md'
                    : 'border-[#ebe5da] opacity-70 hover:opacity-100 hover:border-[#1c3624]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        promo.active
                          ? 'bg-[#eaf6ec] text-[#246b38] border border-[#cbe8d1]'
                          : 'bg-[#faf6f0] text-[#717e74] border border-[#ded7cb]'
                      }`}
                    >
                      {promo.active ? '● Active on Storefront' : 'Paused / Inactive'}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleToggleActive(promo.id, e)}
                      className="text-xs text-[#1c3624] hover:underline font-bold cursor-pointer"
                    >
                      {promo.active ? 'Pause Sale' : 'Activate Sale'}
                    </button>
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#142319] mb-1.5">
                    {promo.title}
                  </h3>

                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="inline-block bg-[#f3f0fc] text-[#6346aa] border border-[#e4dcf8] text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
                      {promo.discountText}
                    </span>
                    {promo.code && (
                      <span className="inline-block bg-[#fcf5e9] text-[#845d1d] border border-[#f4e4cb] text-xs font-mono font-bold px-2.5 py-1 rounded-full">
                        Code: {promo.code}
                      </span>
                    )}
                  </div>

                  {/* Curated Sale Products Included */}
                  <div className="pt-3 border-t border-[#ebe5da]">
                    <div className="flex items-center justify-between text-xs text-[#6b7770] mb-2">
                      <span className="font-semibold text-[#142319]">
                        Curated Sale Products ({saleProductsCount})
                      </span>
                      <span className="text-[11px] text-[#845d1d]">
                        Displays in #sale section
                      </span>
                    </div>

                    {promoProductThumbs.length > 0 ? (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {promoProductThumbs.slice(0, 5).map((img, i) => (
                          <div
                            key={i}
                            className="relative w-10 h-12 rounded-lg overflow-hidden border border-[#ded7cb] bg-white shrink-0"
                          >
                            <Image
                              src={img}
                              alt="Sale product"
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ))}
                        {promoProductThumbs.length > 5 && (
                          <span className="text-xs font-bold text-[#6b7770] px-2 py-1 bg-[#faf6f0] rounded-lg border border-[#ded7cb]">
                            +{promoProductThumbs.length - 5}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#8c978f] italic">
                        Click card to add products from catalog to this sale.
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 mt-4 border-t border-[#ebe5da] flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-[#1c3624] group-hover:underline flex items-center gap-1">
                    <Edit2 size={11} className="text-[#845d1d]" />
                    <span>Click anywhere to edit sale &amp; products</span>
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleDeletePromo(promo.id, promo.title, e)}
                    className="p-1.5 rounded-xl bg-[#fdf0ef] hover:bg-[#fadcd9] text-[#b84840] border border-[#fcd8d5] text-xs transition-colors cursor-pointer"
                    title="Delete Sale Promotion"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* PROMO & SALE PRODUCT MERCHANDISING EDITOR MODAL */}
      {editingPromo && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#ebe5da] rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-[#142319] space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#ebe5da] shrink-0">
              <h3 className="font-display text-lg font-bold text-[#142319]">
                {isCreating ? 'Create Sale Promotion' : `Edit Sale: ${editingPromo.title}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPromo(null)}
                className="w-7 h-7 rounded-full bg-[#faf6f0] hover:bg-[#f0ece4] border border-[#ded7cb] text-[#6b7770] hover:text-[#142319] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#142319] mb-1">
                    Sale Offer Title *
                  </label>
                  <input
                    type="text"
                    value={editingPromo.title}
                    onChange={(e) =>
                      setEditingPromo({ ...editingPromo, title: e.target.value })
                    }
                    placeholder="e.g., Summer Festive Drop, End of Season Sale"
                    className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] rounded-xl px-3.5 py-2 text-xs text-[#142319] outline-hidden placeholder-[#8c978f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#142319] mb-1">
                    Discount Badge / Callout *
                  </label>
                  <input
                    type="text"
                    value={editingPromo.discountText}
                    onChange={(e) =>
                      setEditingPromo({ ...editingPromo, discountText: e.target.value })
                    }
                    placeholder="e.g., UP TO 50% OFF, FLAT ₹300 OFF"
                    className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] rounded-xl px-3.5 py-2 text-xs text-[#142319] outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#142319] mb-1">
                    Coupon Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingPromo.code || ''}
                    onChange={(e) =>
                      setEditingPromo({ ...editingPromo, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g., VARNA30, FESTIVE10"
                    className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-xl px-3.5 py-2 text-xs text-[#142319] outline-hidden font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPromo.active}
                      onChange={(e) =>
                        setEditingPromo({ ...editingPromo, active: e.target.checked })
                      }
                      className="rounded text-[#1c3624] focus:ring-[#1c3624] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-[#142319]">
                      Set Sale as Active on Storefront
                    </span>
                  </label>
                </div>
              </div>

              {/* CURATED SALE PRODUCTS MERCHANDISING SECTION */}
              <div className="pt-3 border-t border-[#ebe5da]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#142319] font-mono">
                      Curate Products For This Sale Drop
                    </h4>
                    <p className="text-[11px] text-[#6b7770]">
                      Select items from your catalog and enter their discounted Sale Price (only applied for this sale).
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-[#206035] bg-[#eaf6ec] px-2.5 py-0.5 rounded-full border border-[#cbe8d1]">
                    {editingPromo.saleProducts?.length || 0} Products Selected
                  </span>
                </div>

                {catalogProducts.length === 0 ? (
                  <div className="p-4 bg-[#faf8f5] rounded-xl text-center text-xs text-[#6b7770] border border-[#ded7cb]">
                    No catalog products found. Please add products first under the Products tab.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto p-1">
                    {catalogProducts.map((p) => {
                      const saleEntry = (editingPromo.saleProducts || []).find(
                        (sp) => sp.productId === p.id
                      )
                      const isIncluded = Boolean(saleEntry)
                      const primaryImage =
                        p.colors?.[0]?.image ||
                        'https://res.cloudinary.com/o6jv6xte/image/upload/v1793532655/varna_store/products/linen-shirt-terracotta.webp'

                      return (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                            isIncluded
                              ? 'bg-[#f7fbf8] border-[#cbe8d1] shadow-2xs'
                              : 'bg-white border-[#ded7cb] opacity-75'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isIncluded}
                              onChange={() => handleToggleSaleProduct(p.id, p.price)}
                              className="w-4 h-4 rounded text-[#1c3624] focus:ring-[#1c3624] cursor-pointer"
                            />

                            <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-[#faf5ee] border border-[#ded7cb] shrink-0">
                              <Image
                                src={primaryImage}
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
                              <p className="text-[11px] text-[#6b7770] mt-0.5">
                                {p.category} • Regular Price: <span className="font-semibold text-[#142319]">₹{p.price}</span>
                              </p>
                            </div>
                          </div>

                          {isIncluded && (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#142319]">Sale Price: ₹</span>
                                <input
                                  type="number"
                                  value={saleEntry?.salePrice ?? p.price}
                                  onChange={(e) => handleUpdateSalePrice(p.id, e.target.value)}
                                  className="w-24 bg-white border border-[#cbe8d1] focus:border-[#1c3624] rounded-xl px-2 py-1 text-xs text-[#142319] font-bold outline-hidden"
                                />
                              </div>
                              {saleEntry && saleEntry.salePrice < p.price && (
                                <span className="text-[10px] font-bold text-[#845d1d] bg-[#fcf5e9] px-2 py-0.5 rounded-full border border-[#f4e4cb]">
                                  {Math.round(((p.price - saleEntry.salePrice) / p.price) * 100)}% OFF
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#ebe5da] shrink-0">
              <button
                type="button"
                onClick={() => setEditingPromo(null)}
                className="px-4 py-2 rounded-xl bg-[#faf6f0] hover:bg-[#f0ece4] border border-[#ded7cb] text-xs font-semibold text-[#556358] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePromo}
                className="px-5 py-2 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-xs shadow-xs transition-all active:scale-97 cursor-pointer"
              >
                Save Sale Promotion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
