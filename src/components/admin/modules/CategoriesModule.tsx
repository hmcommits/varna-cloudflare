'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { useStore } from '@/context/StoreContext'
import { CategoryItem } from '@/types/store'
import {
  Plus,
  Eye,
  Edit2,
  EyeOff,
  X,
  Trash2,
  UploadCloud,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react'

interface CategoriesModuleProps {
  onAddProductForCategory: (categoryName: string) => void
}

export default function CategoriesModule({
  onAddProductForCategory,
}: CategoriesModuleProps) {
  const { draft, updateDraft } = useStore()
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const categories = draft.categories || []
  const activeCount = categories.filter((c) => c.visible).length

  // Start new category
  const handleAddCategory = () => {
    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      title: '',
      subtitle: '',
      image: '',
      link: '#new-arrivals',
      visible: true,
    }
    setEditingCategory(newCat)
    setIsCreating(true)
    setUploadSuccess(false)
  }

  // Save category (new or edit)
  const handleSaveCategory = () => {
    if (!editingCategory) return
    if (!editingCategory.title.trim()) {
      alert('Please enter a category title.')
      return
    }
    if (!editingCategory.image) {
      alert('Please upload an image for this category.')
      return
    }

    updateDraft((prev) => {
      const existing = prev.categories || []
      const index = existing.findIndex((c) => c.id === editingCategory.id)
      let nextList: CategoryItem[]
      if (index >= 0) {
        nextList = existing.map((c) => (c.id === editingCategory.id ? editingCategory : c))
      } else {
        nextList = [...existing, editingCategory]
      }
      return { ...prev, categories: nextList }
    })
    setEditingCategory(null)
    setIsCreating(false)
  }

  // Delete category with assigned products safety warning
  const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const targetCat = categories.find((c) => c.id === id)
    const targetTitle = targetCat?.title || 'this category'

    // Check if any products in inventory currently belong to this category
    const assignedProducts = (draft.products || []).filter(
      (p) => p.category?.trim().toLowerCase() === targetCat?.title?.trim().toLowerCase()
    )

    let confirmMessage = `Are you sure you want to delete category "${targetTitle}"?`
    if (assignedProducts.length > 0) {
      const sampleNames = assignedProducts
        .slice(0, 3)
        .map((p) => p.name)
        .join(', ')
      const remainingCount =
        assignedProducts.length > 3 ? ` and ${assignedProducts.length - 3} more` : ''
      confirmMessage = `⚠️ WARNING: ${assignedProducts.length} product(s) (${sampleNames}${remainingCount}) are currently assigned to "${targetTitle}".\n\nDeleting this category will remove its collection tile from the storefront and category filter.\n\nDo you still want to permanently delete "${targetTitle}"?`
    }

    if (confirm(confirmMessage)) {
      updateDraft((prev) => ({
        ...prev,
        categories: (prev.categories || []).filter((c) => c.id !== id),
      }))
    }
  }

  // Toggle visibility
  const handleToggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    updateDraft((prev) => {
      const nextList = (prev.categories || []).map((c) =>
        c.id === id ? { ...c, visible: !c.visible } : c
      )
      return { ...prev, categories: nextList }
    })
  }

  // Direct photo upload for an existing card
  const handleDirectUploadForCategory = async (catId: string, file: File) => {
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
        updateDraft((prev) => ({
          ...prev,
          categories: (prev.categories || []).map((c) =>
            c.id === catId ? { ...c, image: data.url } : c
          ),
        }))
      } else {
        alert(data.error || 'Upload failed')
      }
    } catch (err) {
      console.error(err)
      alert('Error uploading category image.')
    }
  }

  // Modal photo upload (transforms to WebP Cloudinary URL)
  const handleModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingCategory) return
    setUploading(true)
    setUploadSuccess(false)
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
        setEditingCategory({
          ...editingCategory,
          image: data.url,
        })
        setUploadSuccess(true)
      } else {
        alert(data.error || 'Failed to upload image')
      }
    } catch (err) {
      console.error(err)
      alert('Error uploading category image')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#ebe5da] rounded-3xl p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#845d1d] font-mono">
              COLLECTION TILES &amp; NAVIGATION
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eaf6ec] text-[#1c502b] border border-[#c2e4cb]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#206035]" />
              {activeCount} Active ({categories.length} Total)
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#142319] mt-0.5">
            Categories Grid Merchandising
          </h2>
          <p className="text-xs text-[#6b7770] mt-0.5">
            Click anywhere on a card to edit. All images are automatically converted to WebP on Cloudinary.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleAddCategory}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white text-xs font-bold transition-all shadow-xs active:scale-97 cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            onClick={() => {
              setEditingCategory(cat)
              setIsCreating(false)
              setUploadSuccess(false)
            }}
            className={`bg-white border rounded-3xl p-5 flex flex-col justify-between transition-all shadow-2xs cursor-pointer group ${
              cat.visible
                ? 'border-[#ebe5da] hover:border-[#1c3624] hover:shadow-md'
                : 'border-[#ebe5da] opacity-70 hover:opacity-100 hover:border-[#1c3624]'
            }`}
          >
            <div>
              {/* Category Image Frame */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#faf5ee] mb-3.5 border border-[#ded7cb]">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover object-top group-hover:scale-102 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#8a968f] text-xs">
                    <Sparkles size={20} className="mb-1 text-[#845d1d]" />
                    <span>No image uploaded</span>
                  </div>
                )}

                <span className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs text-[#142319] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-[#ded7cb] shadow-2xs">
                  Slot #{idx + 1}
                </span>

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleToggleVisibility(cat.id, e)}
                    className={`p-1.5 rounded-full backdrop-blur-md transition-colors cursor-pointer border shadow-2xs ${
                      cat.visible
                        ? 'bg-white/90 text-[#206035] border-[#cbe8d1]'
                        : 'bg-[#fdf0ef] text-[#b84840] border-[#fcd8d5]'
                    }`}
                    title={cat.visible ? 'Visible (Click to Hide)' : 'Hidden (Click to Show)'}
                  >
                    {cat.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteCategory(cat.id, e)}
                    className="p-1.5 rounded-full bg-white/90 text-[#b84840] hover:bg-[#fdf0ef] border border-[#fcd8d5] shadow-2xs transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Direct Change Photo Button */}
                <label
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-black/65 hover:bg-black/85 text-white text-[11px] font-semibold backdrop-blur-xs cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <UploadCloud size={12} />
                  <span>Change Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleDirectUploadForCategory(cat.id, file)
                    }}
                  />
                </label>
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-display text-base font-bold text-[#142319] mb-0.5">
                {cat.title}
              </h3>
              <p className="text-xs text-[#845d1d] font-semibold">{cat.subtitle || 'No subtitle set'}</p>
              <p className="text-[10px] text-[#6b7770] mt-1 font-mono truncate">
                Link: {cat.link}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 mt-3 border-t border-[#ebe5da] flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium text-[#1c3624] flex items-center gap-1 group-hover:underline">
                <Edit2 size={11} className="text-[#845d1d]" />
                <span>Click card to edit</span>
              </span>

              {/* Quick Add Product in this Category Shortcut */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddProductForCategory(cat.title.split(' ')[0])
                }}
                className="py-1.5 px-3 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-97"
                title="Directly add a new product in this category"
              >
                <Plus size={13} />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#ebe5da] rounded-3xl max-w-lg w-full p-6 shadow-2xl text-[#142319] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#ebe5da]">
              <h3 className="font-display text-lg font-bold text-[#142319]">
                {isCreating ? 'Add New Category' : `Edit Category: ${editingCategory.title || 'Untitled'}`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null)
                  setIsCreating(false)
                }}
                className="w-7 h-7 rounded-full bg-[#faf6f0] hover:bg-[#f0ece4] border border-[#ded7cb] text-[#6b7770] hover:text-[#142319] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#142319] mb-1">
                  Display Title *
                </label>
                <input
                  type="text"
                  value={editingCategory.title}
                  placeholder="e.g. Shirts, Co-ord Sets, Linen"
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, title: e.target.value })
                  }
                  className="w-full bg-white border border-[#ded7cb] rounded-xl px-3 py-2 text-xs text-[#142319] outline-hidden focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142319] mb-1">
                  Subtitle / Price Hook
                </label>
                <input
                  type="text"
                  value={editingCategory.subtitle}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, subtitle: e.target.value })
                  }
                  placeholder="e.g., Starting at ₹999, 240 GSM Heavyweight"
                  className="w-full bg-white border border-[#ded7cb] rounded-xl px-3 py-2 text-xs text-[#142319] outline-hidden focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624]"
                />
              </div>

              {/* Direct Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#142319] mb-1">
                  Category Image *
                </label>
                <div className="flex items-center gap-4 p-3 bg-[#faf6f0] border border-[#ded7cb] rounded-2xl">
                  {editingCategory.image ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#ded7cb] bg-white shrink-0">
                      <Image
                        src={editingCategory.image}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-[#ded7cb] flex items-center justify-center bg-white text-[#8a968f] text-[10px] text-center p-1 shrink-0">
                      No Image
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white text-xs font-semibold cursor-pointer transition-all shadow-xs">
                      {uploading ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Uploading photo...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={13} />
                          <span>{editingCategory.image ? 'Change Photo' : 'Upload Photo'}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        className="hidden"
                        onChange={handleModalImageUpload}
                      />
                    </label>

                    {uploadSuccess && (
                      <div className="flex items-center gap-1 text-[11px] text-[#206035] font-semibold">
                        <CheckCircle2 size={13} />
                        <span>Photo Ready</span>
                      </div>
                    )}
                    <p className="text-[10px] text-[#6b7770]">
                      Accepts PNG, JPG, WEBP.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142319] mb-1">
                  Destination Anchor / Link
                </label>
                <input
                  type="text"
                  value={editingCategory.link}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, link: e.target.value })
                  }
                  className="w-full bg-white border border-[#ded7cb] rounded-xl px-3 py-2 text-xs text-[#142319] outline-hidden focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] font-mono text-[11px]"
                  placeholder="#new-arrivals or /collections"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#ebe5da]">
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null)
                  setIsCreating(false)
                }}
                className="px-4 py-2 rounded-xl bg-[#faf6f0] hover:bg-[#f0ece4] border border-[#ded7cb] text-xs font-semibold text-[#556358] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCategory}
                className="px-5 py-2 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-xs shadow-xs transition-all active:scale-97 cursor-pointer"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
