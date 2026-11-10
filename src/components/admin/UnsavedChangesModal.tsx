'use client'
import React from 'react'
import { AlertTriangle, X, Check, Trash2 } from 'lucide-react'

interface UnsavedChangesModalProps {
  isOpen: boolean
  moduleName: string
  onStay: () => void
  onDiscard: () => void
  onSaveAndContinue: () => void
  isSaving?: boolean
}

export default function UnsavedChangesModal({
  isOpen,
  moduleName,
  onStay,
  onDiscard,
  onSaveAndContinue,
  isSaving,
}: UnsavedChangesModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-[#ebe5da] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative text-[#142319]">
        {/* Close icon */}
        <button
          type="button"
          onClick={onStay}
          className="absolute top-4 right-4 text-[#8c978f] hover:text-[#142319] p-1.5 rounded-full hover:bg-[#faf6f0] transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Warning Icon & Heading */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#fef6e7] border border-[#fae4ba] text-[#975a16] flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-[#142319]">
              Unsaved Changes Detected
            </h3>
            <p className="text-xs font-semibold text-[#845d1d]">Draft edits in {moduleName}</p>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs text-[#556358] leading-relaxed mb-6">
          You have modified staging configurations in <strong className="text-[#142319]">{moduleName}</strong> that have not been saved. If you leave without saving, these edits will be discarded.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onDiscard}
            className="w-full sm:w-auto flex-1 py-2.5 px-3 rounded-xl bg-[#fdf0ef] hover:bg-[#fadcd9] text-[#b84840] border border-[#fcd8d5] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Discard</span>
          </button>

          <button
            type="button"
            onClick={onStay}
            className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-[#faf6f0] hover:bg-[#f0ece4] border border-[#ded7cb] text-[#556358] text-xs font-semibold transition-colors cursor-pointer"
          >
            Stay Here
          </button>

          <button
            type="button"
            onClick={onSaveAndContinue}
            disabled={isSaving}
            className="w-full sm:w-auto flex-1 py-2.5 px-3.5 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check size={14} />
            )}
            <span>{isSaving ? 'Saving...' : 'Save & Exit'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
