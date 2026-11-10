'use client'
import { useState } from 'react'
import { MessageSquare, Sparkles, CheckCircle2, Send } from 'lucide-react'
import { useStore } from '@/context/StoreContext'

const topicOptions = [
  { id: 'enquiry', label: 'Enquiry' },
  { id: 'custom-order', label: 'Custom Order' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'suggestion', label: 'Suggestion' },
]

export default function Newsletter() {
  const { logEnquiry } = useStore()
  const [selectedTopic, setSelectedTopic] = useState('Enquiry')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = message.trim()
    if (!trimmed) return

    // Log the lead to MongoDB Atlas and admin enquiries module
    await logEnquiry({
      productName: `Customer Message [${selectedTopic}]`,
      color: 'N/A',
      size: 'N/A',
      quantity: 1,
      customNotes: trimmed,
      source: 'Storefront Contact',
      completed: false,
    })

    setSubmitted(true)
    setMessage('')
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <section className="bg-[#1a2e1a] text-white py-12 md:py-16 px-4 relative overflow-hidden">
      {/* Decorative botanical illustration SVGs */}
      <svg
        className="absolute left-0 bottom-0 opacity-15 pointer-events-none select-none"
        width="140"
        height="140"
        viewBox="0 0 140 140"
      >
        <path d="M10 130 Q35 70 90 25 Q70 80 10 130Z" fill="#e8d5b7" />
        <path d="M5 135 Q30 90 70 55 Q50 95 5 135Z" fill="#e8d5b7" opacity="0.6" />
      </svg>
      <svg
        className="absolute right-4 sm:right-8 top-4 opacity-20 pointer-events-none select-none"
        width="70"
        height="110"
        viewBox="0 0 70 110"
      >
        <circle cx="35" cy="15" r="7" fill="#e8d5b7" />
        <line x1="35" y1="22" x2="35" y2="42" stroke="#e8d5b7" strokeWidth="2" />
        <ellipse cx="35" cy="60" rx="12" ry="18" fill="none" stroke="#e8d5b7" strokeWidth="2" />
        <path d="M30 78 Q35 95 30 105" stroke="#e8d5b7" strokeWidth="2" fill="none" />
        <path d="M40 78 Q35 95 40 105" stroke="#e8d5b7" strokeWidth="2" fill="none" />
      </svg>

      <div className="max-w-2xl mx-auto text-center relative z-10">
        <p className="text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#e8d5b7] mb-2 flex items-center justify-center gap-1.5">
          <Sparkles size={14} className="text-[#e8d5b7]" />
          <span>WE&apos;D LOVE TO HEAR FROM YOU</span>
        </p>

        <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-white">
          Have an Enquiry, Feedback or Suggestion?
        </h2>

        <p className="text-xs sm:text-sm text-gray-300 mb-6 md:mb-7 max-w-lg mx-auto leading-relaxed">
          Looking for custom print advice, bulk team jerseys, or want to share feedback? Send our studio a message below.
        </p>

        {/* Topic Selector Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-5">
          {topicOptions.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTopic(t.label)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedTopic === t.label
                  ? 'bg-[#e8d5b7] text-[#1a2e1a] shadow-md scale-105'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/15'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Direct Studio Message Form */}
        <form onSubmit={handleSend} className="max-w-xl mx-auto flex flex-col gap-3">
          <div className="relative">
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Write your ${selectedTopic.toLowerCase()} here...`}
              className="w-full bg-white/10 border border-white/25 focus:border-[#e8d5b7] text-white placeholder-gray-400 text-xs sm:text-sm px-4 py-3 rounded-2xl outline-none focus:bg-white/15 transition-all resize-none shadow-inner"
            />
            <div className="absolute right-3 bottom-3 text-[10px] text-gray-400 pointer-events-none flex items-center gap-1">
              <MessageSquare size={12} />
              <span>Studio Desk</span>
            </div>
          </div>

          {submitted && (
            <div className="bg-[#e8d5b7]/20 border border-[#e8d5b7] text-[#e8d5b7] rounded-xl p-3 text-xs flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} />
              <span>Thank you! Your message has been received by our studio team.</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full sm:w-auto sm:self-center inline-flex items-center justify-center gap-2.5 bg-[#e8d5b7] hover:bg-white text-[#1a2e1a] font-bold text-xs sm:text-sm px-7 py-3 rounded-full shadow-md hover:scale-102 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <span>Submit {selectedTopic}</span>
            <Send size={14} />
          </button>
        </form>
      </div>
    </section>
  )
}
