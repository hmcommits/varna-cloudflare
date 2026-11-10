'use client'
import React, { useState } from 'react'
import { X, Smartphone, Tablet, Monitor, Eye, RotateCw } from 'lucide-react'

interface ModulePreviewDrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  iframeSrc?: string
  children?: React.ReactNode
}

export default function ModulePreviewDrawer({
  isOpen,
  onClose,
  title,
  iframeSrc,
  children,
}: ModulePreviewDrawerProps) {
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [iframeKey, setIframeKey] = useState(0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
      {/* Top Controller Bar */}
      <div className="bg-white border-b border-[#ebe5da] px-4 py-3 flex items-center justify-between z-10 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Eye size={17} className="text-[#845d1d]" />
          <h2 className="font-display font-bold text-sm sm:text-base text-[#142319]">
            Preview: {title}
          </h2>
          <span className="text-[10px] bg-[#eef7f0] text-[#206035] border border-[#d6ecda] px-2.5 py-0.5 rounded-full font-mono font-bold hidden sm:inline-block">
            Responsive Simulation
          </span>
        </div>

        {/* Viewport Width Switchers */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-[#faf6f0] p-1 rounded-xl border border-[#ded7cb]">
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              aria-label="Mobile viewport (390px)"
              className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewport === 'mobile'
                  ? 'bg-[#1c3624] text-white font-bold shadow-2xs'
                  : 'text-[#556358] hover:text-[#142319]'
              }`}
            >
              <Smartphone size={14} />
              <span className="hidden md:inline">Mobile (390px)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewport('tablet')}
              aria-label="Tablet viewport (768px)"
              className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewport === 'tablet'
                  ? 'bg-[#1c3624] text-white font-bold shadow-2xs'
                  : 'text-[#556358] hover:text-[#142319]'
              }`}
            >
              <Tablet size={14} />
              <span className="hidden md:inline">Tablet (768px)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewport('desktop')}
              aria-label="Desktop viewport"
              className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewport === 'desktop'
                  ? 'bg-[#1c3624] text-white font-bold shadow-2xs'
                  : 'text-[#556358] hover:text-[#142319]'
              }`}
            >
              <Monitor size={14} />
              <span className="hidden md:inline">Desktop</span>
            </button>
          </div>

          {iframeSrc && (
            <button
              type="button"
              onClick={() => setIframeKey((k) => k + 1)}
              className="p-1.5 rounded-xl bg-[#faf6f0] hover:bg-[#f0ece4] border border-[#ded7cb] text-[#556358] hover:text-[#142319] transition-colors cursor-pointer"
              title="Reload preview"
            >
              <RotateCw size={14} />
            </button>
          )}

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#faf6f0] hover:bg-[#f0ece4] border border-[#ded7cb] text-[#142319] flex items-center justify-center transition-colors cursor-pointer ml-1"
            aria-label="Close preview"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Preview Stage Container */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-6 flex items-start justify-center bg-[#0a120c]/70 backdrop-blur-md">
        <div
          className={`transition-all duration-300 mx-auto overflow-hidden bg-[#faf8f5] text-[#142319] flex flex-col ${
            viewport === 'mobile'
              ? 'w-[390px] max-w-[95vw] h-[82vh] rounded-[44px] border-[10px] border-[#1a261c] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] my-2 shrink-0'
              : viewport === 'tablet'
              ? 'w-[768px] max-w-[95vw] h-[82vh] rounded-[36px] border-[10px] border-[#1a261c] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] my-2 shrink-0'
              : 'w-full max-w-6xl h-[82vh] rounded-3xl border border-[#ded7cb] shadow-2xl my-2'
          }`}
        >
          {/* Mobile Island & Camera Notch */}
          {viewport === 'mobile' && (
            <div className="bg-[#1a261c] py-2.5 flex items-center justify-center shrink-0">
              <div className="w-24 h-4 bg-black rounded-full flex items-center justify-end px-2.5">
                <div className="w-2 h-2 rounded-full bg-[#1a261c]" />
              </div>
            </div>
          )}

          {/* Tablet Camera Indicator */}
          {viewport === 'tablet' && (
            <div className="bg-[#1a261c] py-2 flex items-center justify-center shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-black/60" />
            </div>
          )}

          {/* Body Content Area */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden relative flex flex-col">
            {iframeSrc ? (
              <iframe
                key={iframeKey}
                src={iframeSrc}
                className="w-full flex-1 border-0 bg-white"
                title={title}
              />
            ) : (
              children
            )}
          </div>

          {/* Mobile Bottom Home Bar */}
          {viewport === 'mobile' && (
            <div className="bg-[#faf8f5] py-2 flex items-center justify-center border-t border-[#ebe5da] shrink-0">
              <div className="w-28 h-1 bg-black/40 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
