'use client'
import React, { useState } from 'react'
import { useStore } from '@/context/StoreContext'
import { Phone, Sparkles, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react'

export default function WhatsAppModule() {
  const { draft, updateDraft } = useStore()

  // Phone update form state
  const [newPhoneInput, setNewPhoneInput] = useState('')
  const [confirmPhoneInput, setConfirmPhoneInput] = useState('')
  const [phoneUpdateMsg, setPhoneUpdateMsg] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [isChangingPhone, setIsChangingPhone] = useState(false)

  const wa = draft.whatsapp || {
    phoneNumber: '916363145972',
    hoursNote: 'Online 10 AM – 9 PM daily',
    floatingButtonVisible: true,
    floatingButtonText: 'Enquire',
    luminousGlow: true,
    templateGeneral:
      "Hi Varna! I'm browsing your storefront and would like to ask a few questions about your collections and custom printing.",
    templateCard:
      "Hi Varna! I'd like to enquire about the {product_name} ({price}). Please share availability and delivery timeframe.",
    templatePdp:
      "Hi Varna! I'd like to order the *{product_name}*:\n\n• *Color:* {color}\n• *Size:* {size}\n• *Quantity:* {quantity} unit(s)\n• *Total Amount:* {price}\n• *Product Link:* {product_url}{custom_notes}\n\nPlease confirm product availability & dispatch timeline!",
    templateCustomPrint:
      "Hi Varna! I'm interested in custom printing / embroidery for bulk team orders. Could you share your catalog, minimum quantities, and turnaround time?",
  }

  const handleUpdate = (field: keyof typeof wa, val: any) => {
    updateDraft((prev) => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        [field]: val,
      },
    }))
  }

  // Handle phone number verification and update
  const handleApplyPhoneNumber = (e: React.FormEvent) => {
    e.preventDefault()
    setPhoneUpdateMsg(null)

    const cleanedNew = newPhoneInput.replace(/\D/g, '')
    const cleanedConfirm = confirmPhoneInput.replace(/\D/g, '')

    if (cleanedNew.length !== 10) {
      setPhoneUpdateMsg({
        type: 'error',
        text: 'Please enter a valid 10-digit mobile number.',
      })
      return
    }

    if (cleanedNew !== cleanedConfirm) {
      setPhoneUpdateMsg({
        type: 'error',
        text: 'The new number and confirm number do not match.',
      })
      return
    }

    const fullWaNumber = `91${cleanedNew}`
    handleUpdate('phoneNumber', fullWaNumber)
    setNewPhoneInput('')
    setConfirmPhoneInput('')
    setIsChangingPhone(false)
    setPhoneUpdateMsg({
      type: 'success',
      text: `WhatsApp number updated to +91 ${cleanedNew}! Click "Save Changes" on the top bar to apply live.`,
    })
  }

  // Extract raw 10 digits for display
  const currentDigits = (wa.phoneNumber || '916363145972').replace(/^91/, '')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#ebe5da] rounded-3xl p-6 shadow-2xs">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#845d1d] font-mono">
            CONCIERGE &amp; SALES FUNNEL
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#142319] mt-0.5">
            WhatsApp Concierge Manager
          </h2>
          <p className="text-xs text-[#6b7770] mt-0.5">
            Configure target business number, live message templates with auto-fill variables, and floating button glow
          </p>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. TARGET BUSINESS NUMBER (LOCKED 91 PREFIX + CONFIRMATION) */}
        <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-display text-base font-bold text-[#142319] flex items-center gap-2">
              <Phone size={16} className="text-[#206035]" />
              <span>Target WhatsApp Business Number</span>
            </h3>

            {/* Current Active Number Card */}
            <div className="bg-[#faf8f5] p-4 rounded-2xl border border-[#ded7cb] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#845d1d] tracking-wider block">
                  Active Business Line
                </span>
                <span className="text-base font-bold text-[#142319] font-mono mt-0.5 block">
                  +91 {currentDigits}
                </span>
                <span className="text-[11px] text-[#206035] font-semibold mt-0.5 block">
                  wa.me/91{currentDigits}
                </span>
              </div>

              {!isChangingPhone && (
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPhone(true)
                    setPhoneUpdateMsg(null)
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97"
                >
                  Change Number
                </button>
              )}
            </div>

            {/* Change Number Form with Confirmation */}
            {isChangingPhone && (
              <form
                onSubmit={handleApplyPhoneNumber}
                className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#ded7cb] space-y-3 animate-in fade-in"
              >
                <div>
                  <label className="block text-xs font-semibold text-[#142319] mb-1">
                    New WhatsApp Number *
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-[#ded7cb] focus-within:border-[#1c3624] focus-within:ring-1 focus-within:ring-[#1c3624]">
                    <span className="bg-[#f0ece4] text-[#6b7770] px-3 py-2 text-xs font-mono font-bold select-none border-r border-[#ded7cb] flex items-center">
                      91
                    </span>
                    <input
                      type="tel"
                      value={newPhoneInput}
                      onChange={(e) =>
                        setNewPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full bg-white px-3 py-2 text-xs text-[#142319] outline-hidden font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#142319] mb-1">
                    Confirm WhatsApp Number *
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-[#ded7cb] focus-within:border-[#1c3624] focus-within:ring-1 focus-within:ring-[#1c3624]">
                    <span className="bg-[#f0ece4] text-[#6b7770] px-3 py-2 text-xs font-mono font-bold select-none border-r border-[#ded7cb] flex items-center">
                      91
                    </span>
                    <input
                      type="tel"
                      value={confirmPhoneInput}
                      onChange={(e) =>
                        setConfirmPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      placeholder="Re-enter 10-digit number"
                      maxLength={10}
                      className="w-full bg-white px-3 py-2 text-xs text-[#142319] outline-hidden font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97"
                  >
                    Confirm &amp; Update
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPhone(false)
                      setNewPhoneInput('')
                      setConfirmPhoneInput('')
                    }}
                    className="py-2 px-3 rounded-xl bg-[#faf6f0] hover:bg-[#f0ece4] border border-[#ded7cb] text-xs font-semibold text-[#6b7770] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {phoneUpdateMsg && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                  phoneUpdateMsg.type === 'success'
                    ? 'bg-[#eaf6ec] border border-[#cbe8d1] text-[#1c502b]'
                    : 'bg-[#fdf0ef] border border-[#fcd8d5] text-[#b84840]'
                }`}
              >
                {phoneUpdateMsg.type === 'success' ? (
                  <CheckCircle2 size={14} className="shrink-0" />
                ) : (
                  <AlertCircle size={14} className="shrink-0" />
                )}
                <span>{phoneUpdateMsg.text}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142319] mb-1">
              Operating Hours / Availability Note
            </label>
            <input
              type="text"
              value={wa.hoursNote}
              onChange={(e) => handleUpdate('hoursNote', e.target.value)}
              placeholder="e.g., Online 10 AM – 9 PM daily (Typical reply: < 5 mins)"
              className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] rounded-xl px-3 py-2 text-xs text-[#142319] outline-hidden placeholder-[#8c978f]"
            />
          </div>
        </div>

        {/* 2. FLOATING CONCIERGE BUTTON TUNING */}
        <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 space-y-4 shadow-2xs">
          <h3 className="font-display text-base font-bold text-[#142319] flex items-center gap-2">
            <Sparkles size={16} className="text-[#845d1d]" />
            <span>Floating Concierge Button Tuning</span>
          </h3>

          <div className="space-y-3 bg-[#faf8f5] p-4 rounded-2xl border border-[#ded7cb]">
            <label className="flex items-center justify-between text-xs cursor-pointer">
              <span className="font-semibold text-[#142319]">Show Floating WhatsApp Button</span>
              <input
                type="checkbox"
                checked={wa.floatingButtonVisible}
                onChange={(e) => handleUpdate('floatingButtonVisible', e.target.checked)}
                className="w-4 h-4 rounded text-[#1c3624] focus:ring-[#1c3624] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between text-xs cursor-pointer pt-2.5 border-t border-[#ebe5da]">
              <div>
                <span className="font-semibold text-[#142319] block">Luminous Breathing Glow Aura</span>
                <span className="text-[10px] text-[#6b7770]">Gentle ambient pulse animation on bottom-right</span>
              </div>
              <input
                type="checkbox"
                checked={wa.luminousGlow}
                onChange={(e) => handleUpdate('luminousGlow', e.target.checked)}
                className="w-4 h-4 rounded text-[#1c3624] focus:ring-[#1c3624] cursor-pointer"
              />
            </label>

            <div className="pt-2.5 border-t border-[#ebe5da]">
              <label className="block text-[11px] font-semibold text-[#142319] mb-1">
                Button Label Text
              </label>
              <input
                type="text"
                value={wa.floatingButtonText}
                onChange={(e) => handleUpdate('floatingButtonText', e.target.value)}
                placeholder="Enquire, Chat, Order on WhatsApp"
                className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-xl px-3 py-1.5 text-xs text-[#142319] outline-hidden placeholder-[#8c978f]"
              />
            </div>
          </div>

          <div className="p-3 bg-[#faf8f5] border border-[#ded7cb] rounded-2xl text-[11px] text-[#6b7770]">
            <span className="font-bold text-[#142319] block mb-0.5">Direct Storefront Link:</span>
            When clicked by customers, enquiries are recorded in real-time under the <strong>Enquiries</strong> tab.
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC MESSAGE TEMPLATES (ALL 4 STOREFRONT FUNNELS) */}
      <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 shadow-2xs space-y-5">
        <div>
          <h3 className="font-display text-base font-bold text-[#142319] flex items-center gap-2">
            <MessageSquare size={16} className="text-[#845d1d]" />
            <span>Dynamic Message Templates (Live Storefront Triggers)</span>
          </h3>
          <p className="text-xs text-[#6b7770] mt-0.5">
            These 4 templates automatically format messages when customers click action buttons across your storefront.
            Supported variables: <code className="text-[#845d1d] font-bold">&#123;product_name&#125;</code>,{' '}
            <code className="text-[#845d1d] font-bold">&#123;color&#125;</code>,{' '}
            <code className="text-[#845d1d] font-bold">&#123;size&#125;</code>,{' '}
            <code className="text-[#845d1d] font-bold">&#123;quantity&#125;</code>,{' '}
            <code className="text-[#845d1d] font-bold">&#123;price&#125;</code>,{' '}
            <code className="text-[#845d1d] font-bold">&#123;product_url&#125;</code>,{' '}
            <code className="text-[#845d1d] font-bold">&#123;custom_notes&#125;</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Template 1: PDP Direct Order */}
          <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ded7cb] space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#142319]">
                  1. Product Details Page (PDP) Order
                </label>
                <span className="text-[10px] text-[#206035] bg-[#eaf6ec] px-2 py-0.5 rounded-full font-bold">
                  Primary Funnel
                </span>
              </div>
              <p className="text-[11px] text-[#6b7770] mb-2">
                Triggered on &ldquo;Direct WhatsApp Order&rdquo; button. Captures selected color, size, qty, and customizations.
              </p>
              <textarea
                rows={5}
                value={wa.templatePdp}
                onChange={(e) => handleUpdate('templatePdp', e.target.value)}
                className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] rounded-xl p-3 text-xs text-[#142319] outline-hidden font-mono leading-relaxed"
              />
            </div>
            <span className="text-[10px] text-[#845d1d] font-mono">
              Auto-syncs color, size, link &amp; custom notes
            </span>
          </div>

          {/* Template 2: Product Card Quick Enquiry */}
          <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ded7cb] space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#142319]">
                  2. Storefront Grid Card Enquiry
                </label>
                <span className="text-[10px] text-[#845d1d] bg-[#fcf5e9] px-2 py-0.5 rounded-full font-bold">
                  Catalog Grid
                </span>
              </div>
              <p className="text-[11px] text-[#6b7770] mb-2">
                Triggered when user clicks the green &ldquo;Enquire&rdquo; pill directly on any product card in the grid.
              </p>
              <textarea
                rows={5}
                value={wa.templateCard}
                onChange={(e) => handleUpdate('templateCard', e.target.value)}
                className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] rounded-xl p-3 text-xs text-[#142319] outline-hidden font-mono leading-relaxed"
              />
            </div>
            <span className="text-[10px] text-[#845d1d] font-mono">
              Auto-syncs product title, price &amp; product link
            </span>
          </div>

          {/* Template 3: General Store & Floating Button */}
          <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ded7cb] space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#142319]">
                  3. Floating Concierge &amp; Topbar Marquee
                </label>
                <span className="text-[10px] text-[#556358] bg-[#f0ece4] px-2 py-0.5 rounded-full font-bold">
                  General Chat
                </span>
              </div>
              <p className="text-[11px] text-[#6b7770] mb-2">
                Pre-fills when visitor clicks bottom-right floating button or top announcement banner.
              </p>
              <textarea
                rows={4}
                value={wa.templateGeneral}
                onChange={(e) => handleUpdate('templateGeneral', e.target.value)}
                className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] rounded-xl p-3 text-xs text-[#142319] outline-hidden font-mono leading-relaxed"
              />
            </div>
            <span className="text-[10px] text-[#845d1d] font-mono">
              General boutique greeting &amp; advice
            </span>
          </div>

          {/* Template 4: Bulk Custom Prints */}
          <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#ded7cb] space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#142319]">
                  4. Custom Bulk Prints &amp; Team Orders
                </label>
                <span className="text-[10px] text-[#6346aa] bg-[#f3f0fc] px-2 py-0.5 rounded-full font-bold">
                  B2B / Custom
                </span>
              </div>
              <p className="text-[11px] text-[#6b7770] mb-2">
                Triggered when customers request custom corporate, college, or wedding bulk prints.
              </p>
              <textarea
                rows={4}
                value={wa.templateCustomPrint}
                onChange={(e) => handleUpdate('templateCustomPrint', e.target.value)}
                className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] rounded-xl p-3 text-xs text-[#142319] outline-hidden font-mono leading-relaxed"
              />
            </div>
            <span className="text-[10px] text-[#845d1d] font-mono">
              Tier pricing &amp; turnaround time inquiry
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
