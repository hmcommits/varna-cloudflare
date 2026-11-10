'use client'
import React, { useState } from 'react'
import { useStore } from '@/context/StoreContext'
import { ReviewItem } from '@/types/store'
import {
  Star,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  MapPin,
  Sparkles,
  X,
  Save,
} from 'lucide-react'

export default function ReviewsModule() {
  const { draft, updateDraft } = useStore()
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null)
  const [isNew, setIsNew] = useState(false)

  const reviewsData = draft.reviews || {
    averageRating: 4.6,
    totalReviewsCount: 120,
    items: [],
  }

  const handleUpdateSummary = (field: 'averageRating' | 'totalReviewsCount', val: number) => {
    updateDraft((prev) => ({
      ...prev,
      reviews: {
        ...prev.reviews,
        [field]: val,
      },
    }))
  }

  const handleOpenNew = () => {
    setEditingReview({
      id: `rev-${Date.now()}`,
      name: '',
      city: '',
      rating: 5,
      title: '',
      comment: '',
      verified: true,
      date: 'Verified Buyer • Just now',
    })
    setIsNew(true)
  }

  const handleSaveReview = () => {
    if (!editingReview) return
    if (!editingReview.name.trim() || !editingReview.comment.trim()) {
      alert('Please provide customer name and review comment')
      return
    }

    updateDraft((prev) => {
      const existing = prev.reviews?.items || []
      let updated: ReviewItem[]
      if (isNew) {
        updated = [editingReview, ...existing]
      } else {
        updated = existing.map((r) => (r.id === editingReview.id ? editingReview : r))
      }
      return {
        ...prev,
        reviews: {
          ...prev.reviews,
          items: updated,
        },
      }
    })

    setEditingReview(null)
    setIsNew(false)
  }

  const handleDeleteReview = (id: string) => {
    if (confirm('Delete this customer testimonial?')) {
      updateDraft((prev) => ({
        ...prev,
        reviews: {
          ...prev.reviews,
          items: (prev.reviews?.items || []).filter((r) => r.id !== id),
        },
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#ebe5da] rounded-3xl p-6 shadow-2xs">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#845d1d] font-mono">
            SOCIAL PROOF &amp; TESTIMONIALS
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#142319] mt-0.5">
            Customer Reviews &amp; Ratings
          </h2>
          <p className="text-xs text-[#6b7770] mt-0.5">
            Manage storefront buyer reviews, verified purchaser badges, and overall trust score summary
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-xs transition-all active:scale-97 cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      {/* Trust Score Summary Metrics Card */}
      <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#845d1d] mb-4 flex items-center gap-2 font-mono">
          <Sparkles size={14} />
          <span>Overall Storefront Rating Summary</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#142319] mb-1.5">
              Average Rating Score (e.g. 4.6 out of 5)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={reviewsData.averageRating}
                onChange={(e) => handleUpdateSummary('averageRating', parseFloat(e.target.value) || 4.5)}
                className="w-32 bg-white border border-[#ded7cb] rounded-xl px-3.5 py-2 text-[#142319] font-mono text-sm focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] outline-hidden font-bold"
              />
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={
                      s <= Math.round(reviewsData.averageRating)
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-gray-300'
                    }
                  />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-[#6b7770] mt-1.5">
              Displayed prominently across hero banner, category headers, and reviews section
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142319] mb-1.5">
              Total Verified Reviews Count (e.g. 120+)
            </label>
            <input
              type="number"
              min="0"
              value={reviewsData.totalReviewsCount}
              onChange={(e) => handleUpdateSummary('totalReviewsCount', parseInt(e.target.value) || 0)}
              className="w-full bg-white border border-[#ded7cb] rounded-xl px-3.5 py-2 text-[#142319] font-mono text-sm focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] outline-hidden font-bold"
            />
            <p className="text-[11px] text-[#6b7770] mt-1.5">
              Shown alongside &quot;Verified Customer Reviews&quot; header in the customer reviews strip
            </p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#142319]">
            Featured Customer Testimonials ({reviewsData.items.length})
          </h3>
          <span className="text-[11px] text-[#6b7770]">
            Reorder or edit to curate the best social proof
          </span>
        </div>

        {reviewsData.items.length === 0 ? (
          <div className="p-8 text-center bg-white border border-[#ebe5da] rounded-3xl text-sm text-[#6b7770] shadow-2xs">
            No reviews added yet. Click &quot;Add Testimonial&quot; above to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviewsData.items.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-[#ebe5da] hover:border-[#1c3624]/40 rounded-3xl p-6 flex flex-col justify-between transition-all group relative shadow-2xs hover:shadow-xs"
              >
                <div>
                  {/* Top row: stars and verified badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={s <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}
                        />
                      ))}
                    </div>

                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#246b38] bg-[#eaf6ec] border border-[#cbe8d1] px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 size={11} />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Comment */}
                  <div className="space-y-1.5 mb-4">
                    <h4 className="font-display text-sm font-bold text-[#142319] line-clamp-1">
                      &quot;{rev.title}&quot;
                    </h4>
                    <p className="text-xs text-[#556358] leading-relaxed line-clamp-4">
                      {rev.comment}
                    </p>
                  </div>
                </div>

                {/* Footer with Author Details & Actions */}
                <div className="pt-3 border-t border-[#ebe5da] flex items-center justify-between text-xs text-[#6b7770]">
                  <div>
                    <p className="font-bold text-[#142319] text-xs">{rev.name}</p>
                    <p className="text-[11px] text-[#8c978f] flex items-center gap-1">
                      <MapPin size={10} className="text-[#845d1d]" />
                      <span>{rev.city}</span>
                      <span>•</span>
                      <span>{rev.date}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReview(rev)
                        setIsNew(false)
                      }}
                      className="p-1.5 rounded-lg bg-[#faf6f0] hover:bg-[#f0ece4] border border-[#ded7cb] text-[#142319] cursor-pointer transition-colors"
                      title="Edit review"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(rev.id)}
                      className="p-1.5 rounded-lg bg-[#fdf0ef] hover:bg-[#fadcd9] text-[#b84840] border border-[#fcd8d5] cursor-pointer transition-colors"
                      title="Delete review"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit / Create Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#ebe5da] rounded-3xl max-w-lg w-full p-6 text-[#142319] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ebe5da] pb-3">
              <h3 className="font-display text-lg font-bold text-[#142319]">
                {isNew ? 'Add Customer Testimonial' : 'Edit Testimonial'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="w-7 h-7 rounded-full bg-[#faf6f0] hover:bg-[#f0ece4] border border-[#ded7cb] text-[#6b7770] hover:text-[#142319] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#142319] mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={editingReview.name}
                    onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                    placeholder="e.g. Arjun Menon"
                    className="w-full bg-white border border-[#ded7cb] rounded-xl px-3 py-2 text-xs text-[#142319] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] outline-hidden placeholder-[#8c978f]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#142319] mb-1">City / Region</label>
                  <input
                    type="text"
                    value={editingReview.city}
                    onChange={(e) => setEditingReview({ ...editingReview, city: e.target.value })}
                    placeholder="e.g. Bengaluru"
                    className="w-full bg-white border border-[#ded7cb] rounded-xl px-3 py-2 text-xs text-[#142319] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] outline-hidden placeholder-[#8c978f]"
                  />
                </div>
              </div>

              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-semibold text-[#142319] mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditingReview({ ...editingReview, rating: s })}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        size={22}
                        className={
                          s <= editingReview.rating
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-gray-300 hover:text-amber-400'
                        }
                      />
                    </button>
                  ))}
                  <span className="text-xs text-[#6b7770] font-mono ml-2">
                    {editingReview.rating} out of 5 stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142319] mb-1">Headline / Title</label>
                <input
                  type="text"
                  value={editingReview.title}
                  onChange={(e) => setEditingReview({ ...editingReview, title: e.target.value })}
                  placeholder="e.g. Cloud-soft from day 1"
                  className="w-full bg-white border border-[#ded7cb] rounded-xl px-3 py-2 text-xs text-[#142319] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] outline-hidden placeholder-[#8c978f]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#142319] mb-1">Review Body Comment</label>
                <textarea
                  rows={3}
                  value={editingReview.comment}
                  onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                  placeholder="Detailed customer experience..."
                  className="w-full bg-white border border-[#ded7cb] rounded-xl px-3 py-2 text-xs text-[#142319] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] outline-hidden placeholder-[#8c978f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-semibold text-[#142319] mb-1">Date Note</label>
                  <input
                    type="text"
                    value={editingReview.date}
                    onChange={(e) => setEditingReview({ ...editingReview, date: e.target.value })}
                    placeholder="e.g. Verified Buyer • 3 days ago"
                    className="w-full bg-white border border-[#ded7cb] rounded-xl px-3 py-2 text-xs text-[#142319] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] outline-hidden placeholder-[#8c978f]"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editingReview.verified}
                      onChange={(e) =>
                        setEditingReview({ ...editingReview, verified: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#1c3624] rounded cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-[#142319]">
                      Verified Buyer Badge
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#ebe5da]">
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="px-4 py-2 rounded-xl bg-[#faf6f0] hover:bg-[#f0ece4] border border-[#ded7cb] text-xs font-semibold text-[#556358] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-xs transition-all active:scale-97 cursor-pointer shadow-xs"
              >
                <Save size={14} />
                <span>Save Testimonial</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
