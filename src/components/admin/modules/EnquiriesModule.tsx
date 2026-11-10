'use client'
import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { useStore } from '@/context/StoreContext'
import { DeliveryAddress } from '@/types/store'
import {
  Download,
  Trash2,
  Clock,
  Check,
  Search,
  Copy,
  MapPin,
  ShoppingBag,
  Sparkles,
  DollarSign,
} from 'lucide-react'

const STATUS_OPTIONS = [
  'New',
  'Contacted',
  'Payment Pending',
  'Paid',
  'Dispatched',
  'Delivered',
  'Cancelled',
] as const

export default function EnquiriesModule() {
  const { draft, updateEnquiries } = useStore()
  const enquiries = useMemo(() => draft.enquiries || [], [draft.enquiries])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Update Status handler - Auto-persisted immediately without requiring top-bar "Save Changes"
  const handleStatusChange = async (id: string, newStatus: string) => {
    const isCompleted = newStatus === 'Delivered' || newStatus === 'Paid' || newStatus === 'Dispatched'

    updateEnquiries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: newStatus as any, completed: isCompleted ? e.completed : false } : e
      )
    )

    // Async sync to MongoDB Atlas and store config
    try {
      await fetch('/api/admin/enquiry', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
    } catch (err) {
      console.warn('Could not sync status change to API:', err)
    }
  }

  // Toggle Completed status - Auto-persisted immediately
  const handleToggleCompleted = async (id: string) => {
    const item = enquiries.find((e) => e.id === id)
    const nextCompleted = !item?.completed

    updateEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: nextCompleted } : e))
    )

    try {
      await fetch('/api/admin/enquiry', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: nextCompleted }),
      })
    } catch (err) {
      console.warn('Could not sync completed status to API:', err)
    }
  }

  // Remove enquiry - Auto-persisted immediately
  const handleRemove = async (id: string) => {
    if (confirm('Are you sure you want to permanently delete this order/enquiry?')) {
      updateEnquiries((prev) => prev.filter((e) => e.id !== id))

      try {
        await fetch(`/api/admin/enquiry?id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        })
      } catch (err) {
        console.warn('Could not sync deletion to API:', err)
      }
    }
  }

  // Copy Delivery Address for Courier (Shiprocket, Delhivery, DTDC, India Post)
  const handleCopyAddress = (addr: DeliveryAddress, id: string) => {
    const text = `${addr.fullName}
Phone: +91 ${addr.phoneNumber}
${addr.houseNumber}
${addr.streetAddress}
Landmark: ${addr.landmark}
${addr.city}, ${addr.state} - ${addr.pincode}
Address Type: ${addr.addressType}`

    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtered Enquiries
  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((enq) => {
      // Status match
      if (statusFilter !== 'All') {
        const itemStatus = enq.status || (enq.completed ? 'Delivered' : 'New')
        if (itemStatus !== statusFilter) return false
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = (enq.customerName || '').toLowerCase().includes(q)
        const matchPhone = (enq.customerPhone || '').toLowerCase().includes(q)
        const matchProduct = (enq.productName || '').toLowerCase().includes(q)
        const matchPin = (enq.address?.pincode || '').includes(q)
        const matchCity = (enq.address?.city || '').toLowerCase().includes(q)
        const matchId = (enq.id || '').toLowerCase().includes(q)

        return matchName || matchPhone || matchProduct || matchPin || matchCity || matchId
      }

      return true
    })
  }, [enquiries, statusFilter, searchQuery])

  // Key Metrics
  const metrics = useMemo(() => {
    const totalOrders = enquiries.length
    const newOrders = enquiries.filter((e) => (e.status || 'New') === 'New' && !e.completed).length
    const totalRevenue = enquiries.reduce((sum, e) => sum + (e.totalAmount || 0), 0)
    return { totalOrders, newOrders, totalRevenue }
  }, [enquiries])

  // Export to CSV
  const handleExportCSV = () => {
    if (enquiries.length === 0) {
      alert('No enquiries or orders to export.')
      return
    }

    const headers = [
      'Order ID',
      'Date/Time',
      'Customer Name',
      'Customer Phone',
      'Total Amount (INR)',
      'Status',
      'Items Summary',
      'Flat/House',
      'Street/Area',
      'Landmark',
      'City',
      'State',
      'PIN Code',
      'Address Type',
      'Custom Notes',
      'Source',
    ]

    const rows = enquiries.map((e) => [
      `"${e.id}"`,
      `"${e.timestamp}"`,
      `"${e.customerName || e.address?.fullName || 'N/A'}"`,
      `"${e.customerPhone || e.address?.phoneNumber || 'N/A'}"`,
      e.totalAmount || (e.quantity * 999),
      `"${e.status || (e.completed ? 'Completed' : 'New')}"`,
      `"${e.items ? e.items.map((i) => `${i.name} (${i.color}, ${i.size}) x${i.quantity}`).join('; ') : e.productName}"`,
      `"${e.address?.houseNumber || ''}"`,
      `"${e.address?.streetAddress || ''}"`,
      `"${e.address?.landmark || ''}"`,
      `"${e.address?.city || ''}"`,
      `"${e.address?.state || ''}"`,
      `"${e.address?.pincode || ''}"`,
      `"${e.address?.addressType || ''}"`,
      `"${(e.customNotes || '').replace(/"/g, '""')}"`,
      `"${e.source}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `varna_orders_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Metrics Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-[#ebe5da] rounded-3xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#845d1d] font-mono">
              ALL TIME
            </span>
            <h3 className="font-display text-2xl font-bold text-[#142319] mt-0.5">
              {metrics.totalOrders}
            </h3>
            <span className="text-xs text-[#6b7770]">Total orders &amp; leads recorded</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#1c3624]/10 text-[#1c3624] flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#ebe5da] rounded-3xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#975a16] font-mono">
              PENDING ACTION
            </span>
            <h3 className="font-display text-2xl font-bold text-[#975a16] mt-0.5">
              {metrics.newOrders}
            </h3>
            <span className="text-xs text-[#6b7770]">New orders requiring follow-up</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#fef6e7] text-[#975a16] flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#ebe5da] rounded-3xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#1e4a36] font-mono">
              TOTAL ORDER VALUE
            </span>
            <h3 className="font-display text-2xl font-bold text-[#1e4a36] mt-0.5">
              ₹{metrics.totalRevenue.toLocaleString('en-IN')}
            </h3>
            <span className="text-xs text-[#6b7770]">Combined cart checkout value</span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#eaf6ec] text-[#1e4a36] flex items-center justify-center">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Main Container Header with Actions */}
      <div className="bg-white border border-[#ebe5da] rounded-3xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#845d1d] font-mono">
              ORDERS &amp; ENQUIRIES HUB
            </span>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#142319] mt-0.5">
              Customer Orders &amp; WhatsApp Checkout Leads
            </h2>
            <p className="text-xs text-[#6b7770] mt-0.5">
              Review customer items, Indian delivery addresses with landmarks, and connect directly on WhatsApp
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-xs shadow-xs transition-all active:scale-97 cursor-pointer"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-[#ebe5da]">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8c978f]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone, PIN, city or product..."
              className="w-full bg-[#faf8f4] border border-[#ebe5da] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#142319] placeholder-[#8c978f] outline-none focus:border-[#1c3624] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8c978f] hover:text-[#142319]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {['All', 'New', 'Payment Pending', 'Paid', 'Dispatched', 'Delivered', 'Cancelled'].map(
              (tab) => {
                const count =
                  tab === 'All'
                    ? enquiries.length
                    : enquiries.filter((e) => (e.status || 'New') === tab).length

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      statusFilter === tab
                        ? 'bg-[#1c3624] text-white shadow-xs'
                        : 'bg-[#faf8f4] text-[#556358] hover:bg-[#f0ece4] border border-[#ebe5da]'
                    }`}
                  >
                    <span>{tab}</span>
                    <span
                      className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                        statusFilter === tab
                          ? 'bg-white/20 text-white'
                          : 'bg-[#ebe5da] text-[#556358]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              }
            )}
          </div>
        </div>
      </div>

      {/* Orders List Stream */}
      {filteredEnquiries.length === 0 ? (
        <div className="bg-white border border-[#ebe5da] rounded-3xl p-12 text-center text-[#6b7770] space-y-2">
          <ShoppingBag size={32} className="mx-auto text-[#c4a675] opacity-60" />
          <h4 className="font-display text-base font-bold text-[#142319]">
            No matching orders found
          </h4>
          <p className="text-xs max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'All'
              ? 'Try adjusting your search keywords or status filter.'
              : 'Orders placed by visitors via WhatsApp Checkout will appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEnquiries.map((enq) => {
            const hasFullAddress = Boolean(enq.address?.houseNumber && enq.address?.city)
            const customerName = enq.customerName || enq.address?.fullName || 'Valued Customer'
            const cleanPhone = (enq.customerPhone || enq.address?.phoneNumber || '').replace(
              /\D/g,
              ''
            )
            const phoneForWhatsApp = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone
            const currentStatus = enq.status || (enq.completed ? 'Delivered' : 'New')

            const siteOrigin =
              typeof window !== 'undefined' && window.location.origin
                ? window.location.origin
                : ''

            // Direct WhatsApp message from store admin to customer
            const adminFollowupText = encodeURIComponent(
              `Hi ${customerName}! Thank you for your order with Varna (Ref: #${enq.id}). We are reviewing your order details:\n\n` +
                (enq.items
                  ? enq.items
                      .map(
                        (i) =>
                          `• ${i.name} (${i.color}, ${i.size}) × ${i.quantity}` +
                          (i.productId ? `\n  Link: ${siteOrigin}/products/${i.productId}` : '')
                      )
                      .join('\n\n')
                  : `• ${enq.productName} (${enq.color}, ${enq.size}) × ${enq.quantity}`) +
                (enq.totalAmount ? `\n\nTotal Payable: ₹${enq.totalAmount.toLocaleString('en-IN')}` : '') +
                `\n\nPlease reply here to confirm and we will share the UPI payment QR code!`
            )

            const adminWhatsAppUrl = phoneForWhatsApp
              ? `https://wa.me/${phoneForWhatsApp}?text=${adminFollowupText}`
              : null

            return (
              <div
                key={enq.id}
                className="bg-white border border-[#ebe5da] rounded-3xl p-5 sm:p-6 shadow-2xs hover:border-[#1c3624]/40 transition-all space-y-4"
              >
                {/* Header Row: ID, Timestamp, Status & Action Dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ebe5da]">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold bg-[#faf6f0] text-[#845d1d] border border-[#e8d5b7] px-2.5 py-1 rounded-lg">
                      #{enq.id}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[#6b7770]">
                      <Clock size={12} className="text-[#845d1d]" />
                      <span>{enq.timestamp}</span>
                    </span>
                    <span className="text-[10px] bg-[#f0ece4] text-[#556358] font-bold px-2 py-0.5 rounded-md">
                      {enq.source}
                    </span>
                  </div>

                  {/* Status Dropdown & Completed Toggle */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <label className="text-[11px] font-semibold text-[#6b7770]">
                      Status:
                    </label>
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                      className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border outline-none cursor-pointer transition-all ${
                        currentStatus === 'New'
                          ? 'bg-[#fef6e7] text-[#975a16] border-[#fae4ba]'
                          : currentStatus === 'Paid'
                          ? 'bg-[#eaf6ec] text-[#246b38] border-[#cbe8d1]'
                          : currentStatus === 'Dispatched'
                          ? 'bg-[#e8f2fc] text-[#1c65b9] border-[#c4ddf8]'
                          : currentStatus === 'Payment Pending'
                          ? 'bg-[#fff4e5] text-[#b45309] border-[#fed7aa]'
                          : currentStatus === 'Delivered'
                          ? 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]'
                          : 'bg-[#faf8f4] text-[#6b7770] border-[#ebe5da]'
                      }`}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleToggleCompleted(enq.id)}
                      className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        enq.completed
                          ? 'bg-[#eaf6ec] text-[#246b38] border-[#cbe8d1]'
                          : 'bg-[#faf8f4] text-[#6b7770] border-[#ebe5da] hover:bg-[#f0ece4]'
                      }`}
                      title={enq.completed ? 'Mark as Pending' : 'Mark as Completed'}
                    >
                      <Check size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(enq.id)}
                      className="p-1.5 rounded-xl bg-[#fdf0ef] hover:bg-[#fadcd9] text-[#b84840] border border-[#fcd8d5] transition-colors cursor-pointer"
                      title="Delete Order Permanently"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Main Content: 2-Column Split (Left: Customer & Address | Right: Ordered Items) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* LEFT: Customer Details & Indian Delivery Address (lg:col-span-5) */}
                  <div className="lg:col-span-5 space-y-3.5 bg-[#faf8f4] rounded-2xl p-4 border border-[#ebe5da]">
                    {/* Customer Identity */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1c3624] text-white flex items-center justify-center font-bold text-xs">
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-[#142319] leading-tight">
                            {customerName}
                          </h4>
                          {cleanPhone && (
                            <span className="text-[11px] font-mono text-[#556358]">
                              +91 {cleanPhone}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 1-Click WhatsApp Chat Button */}
                      {adminWhatsAppUrl && (
                        <a
                          href={adminWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                          title="Open WhatsApp chat with this customer to confirm order & send UPI QR"
                        >
                          <div className="relative w-3.5 h-3.5">
                            <Image
                              src="https://res.cloudinary.com/o6jv6xte/image/upload/v1793532654/varna_store/icons/whatsapp-icon.webp"
                              alt="WhatsApp"
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span>Chat on WhatsApp</span>
                        </a>
                      )}
                    </div>

                    {/* Indian Delivery Address Box */}
                    {hasFullAddress && enq.address ? (
                      <div className="pt-2 border-t border-[#ebe5da] space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#142319]">
                            <MapPin size={13} className="text-[#845d1d]" />
                            <span>Indian Delivery Address</span>
                          </div>
                          <span className="text-[10px] font-semibold bg-white border border-[#ebe5da] px-2 py-0.5 rounded-md text-[#556358]">
                            {enq.address.addressType === 'Home'
                              ? '🏠 Home'
                              : enq.address.addressType === 'Work'
                              ? '🏢 Work'
                              : '📍 Other'}
                          </span>
                        </div>

                        <div className="text-xs text-[#334237] space-y-0.5 leading-relaxed bg-white p-3 rounded-xl border border-[#ebe5da]">
                          <p className="font-semibold text-[#142319]">
                            {enq.address.houseNumber}
                          </p>
                          <p>{enq.address.streetAddress}</p>

                          {/* Highlighted Landmark */}
                          {enq.address.landmark && (
                            <div className="my-1 py-1 px-2 rounded-lg bg-[#fef6e7] border border-[#fae4ba] text-[#975a16] font-semibold text-[11px] flex items-center gap-1">
                              <span>📍 Landmark:</span>
                              <span>{enq.address.landmark}</span>
                            </div>
                          )}

                          <p className="font-semibold text-[#142319]">
                            {enq.address.city}, {enq.address.state} —{' '}
                            <span className="font-mono text-[#1c3624] font-bold">
                              {enq.address.pincode}
                            </span>
                          </p>
                        </div>

                        {/* Copy Address for Courier */}
                        <button
                          type="button"
                          onClick={() => handleCopyAddress(enq.address!, enq.id)}
                          className="w-full py-1.5 px-3 rounded-xl bg-white hover:bg-[#f0ece4] border border-[#ebe5da] text-[11px] font-semibold text-[#142319] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          {copiedId === enq.id ? (
                            <>
                              <Check size={12} className="text-[#246b38]" />
                              <span className="text-[#246b38]">Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} className="text-[#845d1d]" />
                              <span>Copy Address for Courier (Shiprocket / Delhivery)</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-[#ebe5da] text-[11px] text-[#8c978f] italic">
                        Standard product enquiry (No delivery address provided)
                      </div>
                    )}
                  </div>

                  {/* RIGHT: Ordered Items Breakdown & Financials (lg:col-span-7) */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-[#ebe5da]">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#142319] flex items-center gap-1.5">
                        <ShoppingBag size={13} className="text-[#1c3624]" />
                        <span>Order Items Breakdown</span>
                      </span>
                      {enq.totalAmount && (
                        <span className="font-display font-bold text-sm sm:text-base text-[#1c3624]">
                          Total: ₹{enq.totalAmount.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* If multiple items from Cart Checkout */}
                    {enq.items && enq.items.length > 0 ? (
                      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                        {enq.items.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-[#ebe5da] bg-[#faf8f4] hover:bg-white transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {item.image && (
                                <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-white border border-[#ebe5da] flex-shrink-0">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover object-top"
                                  />
                                </div>
                              )}
                              <div className="min-w-0">
                                {item.productId ? (
                                  <a
                                    href={`/products/${item.productId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-xs text-[#142319] hover:text-[#1c3624] hover:underline flex items-center gap-1 group truncate"
                                    title="View product description page in store"
                                  >
                                    <span className="truncate">{item.name}</span>
                                    <span className="text-[10px] text-[#845d1d] opacity-70 group-hover:opacity-100 transition-opacity">↗</span>
                                  </a>
                                ) : (
                                  <span className="font-semibold text-xs text-[#142319] block truncate">
                                    {item.name}
                                  </span>
                                )}
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <span className="text-[10px] font-medium bg-white px-1.5 py-0.5 rounded border border-[#ebe5da]">
                                    Color: {item.color}
                                  </span>
                                  <span className="text-[10px] font-bold bg-[#1c3624]/10 text-[#1c3624] px-1.5 py-0.5 rounded">
                                    Size: {item.size}
                                  </span>
                                  <span className="text-[10px] text-[#6b7770]">
                                    Qty: <strong>{item.quantity}</strong>
                                  </span>
                                </div>
                                {item.customNotes && (
                                  <div className="mt-1 text-[10px] text-[#845d1d] bg-[#fef6e7] border border-[#fae4ba] px-2 py-0.5 rounded flex items-center gap-1">
                                    <Sparkles size={10} className="shrink-0" />
                                    <span className="truncate">
                                      Customization: &ldquo;{item.customNotes}&rdquo;
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span className="font-bold text-xs text-[#142319] block">
                                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                              {item.quantity > 1 && (
                                <span className="text-[10px] text-[#6b7770]">
                                  (₹{item.price} each)
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Legacy Single-Product Enquiry Card */
                      <div className="p-3 bg-[#faf8f4] border border-[#ebe5da] rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#142319]">
                            {enq.productName}
                          </span>
                          <span className="text-xs font-bold text-[#1c3624]">
                            Qty: {enq.quantity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#556358]">
                          <span>Color: <strong>{enq.color}</strong></span>
                          <span>•</span>
                          <span>Size: <strong>{enq.size}</strong></span>
                        </div>
                        {enq.customNotes && (
                          <div className="mt-1 text-[11px] text-[#845d1d] bg-[#fef6e7] border border-[#fae4ba] p-2 rounded-lg">
                            Note: &ldquo;{enq.customNotes}&rdquo;
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
