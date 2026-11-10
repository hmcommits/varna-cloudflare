'use client'
import React from 'react'
import { useStore } from '@/context/StoreContext'
import { Eye, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

export default function GlobalPreviewBanner() {
  const { globalPreviewMode, setGlobalPreviewMode, saveDraft, isSaving } = useStore()

  if (!globalPreviewMode) return null

  return (
    <div className="sticky top-0 z-50 bg-[#0d140e] text-[#f4efe6] border-b border-[#c4a675]/40 px-4 py-2.5 shadow-xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c4a675] animate-ping" />
          <div className="flex items-center gap-1.5 font-bold tracking-wider text-[#e8d5b7] uppercase">
            <Eye size={15} />
            <span>Live Draft Preview Mode Active</span>
          </div>
          <span className="hidden md:inline-block text-[#a89d8f] text-[11px]">
            — You are viewing unsaved staging edits. Live visitors see the published version.
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#f4efe6] font-medium transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Return to Admin</span>
          </Link>

          <button
            type="button"
            onClick={() => setGlobalPreviewMode(false)}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#a89d8f] hover:text-white font-medium transition-colors"
          >
            Exit Preview
          </button>

          <button
            type="button"
            onClick={async () => {
              const success = await saveDraft()
              if (success) {
                setGlobalPreviewMode(false)
              }
            }}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1fb355] text-black font-bold shadow-md transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <span>Publishing...</span>
            ) : (
              <>
                <Check size={14} />
                <span>Publish All Live</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
