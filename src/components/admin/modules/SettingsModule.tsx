'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { useStore } from '@/context/StoreContext'
import { StoreSettings } from '@/types/store'
import {
  Upload,
  Eye,
  EyeOff,
  KeyRound,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react'

export default function SettingsModule() {
  const { draft, updateDraft } = useStore()
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Password change form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const settings = draft.settings || {
    storeName: 'Varna',
    subtitle: 'Custom Wear & Prints',
    slogan: 'Wear Your Colors',
    supportPhone: '+91 6363145972',
    studioAddress: 'Karkala, Udupi, Karnataka',
    copyrightText: '© 2026 Varna. All rights reserved.',
    logoUrl:
      'https://res.cloudinary.com/o6jv6xte/image/upload/v1793872122/varna_store/logo/varna-brandmark-transparent-v3.webp',
    passcode: 'varna2026',
    storeStatus: 'Online',
  }

  const handleUpdate = (field: keyof StoreSettings, val: any) => {
    updateDraft((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: val,
      },
    }))
  }

  // Upload Logo file via API
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
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

      if (res.ok) {
        const data = await res.json()
        handleUpdate('logoUrl', data.url)
      } else {
        alert('Failed to upload logo.')
      }
    } catch (err) {
      console.error('Logo upload failed:', err)
      alert('Logo upload failed.')
    } finally {
      setUploadingLogo(false)
    }
  }

  // Handle password update with verification
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)

    const expectedCurrent = settings.passcode || 'varna2026'
    if (currentPassword !== expectedCurrent) {
      setPasswordMsg({
        type: 'error',
        text: 'Current password is incorrect. Please enter your existing passcode.',
      })
      return
    }

    if (!newPassword || newPassword.length < 4) {
      setPasswordMsg({
        type: 'error',
        text: 'New password must be at least 4 characters long.',
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({
        type: 'error',
        text: 'New password and Confirm password do not match.',
      })
      return
    }

    handleUpdate('passcode', newPassword)
    // Update the session token so future API calls use the new passcode
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('varna_admin_token', newPassword)
    }
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordMsg({
      type: 'success',
      text: 'Vault password updated successfully! Click "Save Changes" on the top bar to apply live.',
    })
  }

  // Clean support phone number to extract 10 digits
  const rawSupportPhone = settings.supportPhone || ''
  const phoneDigitsOnly = rawSupportPhone
    .replace(/^\+?91[\s-]*/, '')
    .replace(/\D/g, '')

  const handleSupportPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    handleUpdate('supportPhone', `+91 ${digits}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#ebe5da] rounded-3xl p-6 shadow-2xs">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#845d1d] font-mono">
            GLOBAL CONFIGURATION
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#142319] mt-0.5">
            Store Identity &amp; Security Settings
          </h2>
          <p className="text-xs text-[#6b7770] mt-0.5">
            Manage your brand logo, name, tagline, studio contact, and vault security passcode
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. LOGO MANAGER (NO RAW CLOUDINARY URL DISPLAYED) */}
        <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 space-y-4 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-[#142319] flex items-center gap-2">
              <Sparkles size={16} className="text-[#845d1d]" />
              <span>Store Brand Logo</span>
            </h3>
            <p className="text-xs text-[#6b7770] mt-1">
              Your official brand logo displayed across storefront navbar, footer, and packaging labels.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#faf8f5] p-5 rounded-2xl border border-[#ded7cb]">
            <div className="relative h-16 w-28 sm:h-20 sm:w-36 rounded-2xl border border-[#ded7cb] shrink-0 shadow-xs flex items-center justify-center overflow-hidden bg-white p-2">
              <Image
                src={
                  settings.logoUrl ||
                  'https://res.cloudinary.com/o6jv6xte/image/upload/v1793872122/varna_store/logo/varna-brandmark-transparent-v3.webp'
                }
                alt={settings.storeName || 'Store Logo'}
                fill
                className="object-contain p-1"
                unoptimized
              />
            </div>
            <div className="space-y-2 flex-1">
              <label className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">
                <Upload size={13} />
                <span>{uploadingLogo ? 'Converting to WebP...' : 'Upload / Change Logo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-[#6b7770]">
                PNG, JPG, SVG supported.
              </p>
            </div>
          </div>

          <div className="p-3 bg-[#eaf6ec] border border-[#cbe8d1] rounded-xl flex items-center gap-2 text-xs font-semibold text-[#1c502b]">
            <CheckCircle2 size={15} />
            <span>Active Store Logo Connected</span>
          </div>
        </div>

        {/* 2. VAULT SECURITY PASSCODE (CURRENT + NEW + CONFIRM WITH EYE BUTTONS) */}
        <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 space-y-4 shadow-2xs">
          <div>
            <h3 className="font-display text-base font-bold text-[#142319] flex items-center gap-2">
              <KeyRound size={16} className="text-[#845d1d]" />
              <span>Change Vault Passcode</span>
            </h3>
            <p className="text-xs text-[#6b7770] mt-0.5">
              Enter your current password to verify identity, then choose a new passcode.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-3">
            {/* Field 1: Current Password */}
            <div>
              <label className="block text-xs font-semibold text-[#142319] mb-1">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] rounded-xl pl-3 pr-10 py-2 text-xs text-[#142319] outline-hidden font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b948d] hover:text-[#142319] p-1 cursor-pointer"
                  title={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Field 2: New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#142319] mb-1">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 4 characters)"
                  className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] rounded-xl pl-3 pr-10 py-2 text-xs text-[#142319] outline-hidden font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b948d] hover:text-[#142319] p-1 cursor-pointer"
                  title={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Field 3: Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#142319] mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624] rounded-xl pl-3 pr-10 py-2 text-xs text-[#142319] outline-hidden font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b948d] hover:text-[#142319] p-1 cursor-pointer"
                  title={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {passwordMsg && (
              <div
                className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                  passwordMsg.type === 'success'
                    ? 'bg-[#eaf6ec] border border-[#cbe8d1] text-[#1c502b]'
                    : 'bg-[#fdf0ef] border border-[#fcd8d5] text-[#b84840]'
                }`}
              >
                {passwordMsg.type === 'success' ? (
                  <CheckCircle2 size={14} className="shrink-0" />
                ) : (
                  <AlertCircle size={14} className="shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98 flex items-center justify-center gap-1.5"
            >
              <Lock size={13} />
              <span>Update Password</span>
            </button>
          </form>
        </div>
      </div>

      {/* Brand Identity & Contact Details */}
      <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 space-y-4 shadow-2xs">
        <h3 className="font-display text-base font-bold text-[#142319]">
          Brand Identity &amp; Contact Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#142319] mb-1">
              Store Name <span className="text-[#6b7770] font-normal text-[11px]">(Optional)</span>
            </label>
            <input
              type="text"
              value={settings.storeName || ''}
              onChange={(e) => handleUpdate('storeName', e.target.value)}
              placeholder="e.g. Varna (optional)"
              className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-xl px-3 py-2 text-xs text-[#142319] outline-hidden"
            />
            <p className="text-[10px] text-[#6b7770] mt-1">
              Optional. If blank, only your logo image will be displayed on the header.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142319] mb-1">
              Subtitle
            </label>
            <input
              type="text"
              value={settings.subtitle}
              onChange={(e) => handleUpdate('subtitle', e.target.value)}
              className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-xl px-3 py-2 text-xs text-[#142319] outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#142319] mb-1">
              Slogan / Tagline
            </label>
            <input
              type="text"
              value={settings.slogan}
              onChange={(e) => handleUpdate('slogan', e.target.value)}
              className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-xl px-3 py-2 text-xs text-[#142319] outline-hidden"
            />
          </div>

          {/* Support Phone with locked +91 prefix */}
          <div>
            <label className="block text-xs font-semibold text-[#142319] mb-1">
              Support Phone (Customer Help Desk)
            </label>
            <div className="flex rounded-xl overflow-hidden border border-[#ded7cb] focus-within:border-[#1c3624] focus-within:ring-1 focus-within:ring-[#1c3624]">
              <span className="bg-[#f0ece4] text-[#6b7770] px-3 py-2 text-xs font-mono font-bold select-none border-r border-[#ded7cb] flex items-center">
                +91
              </span>
              <input
                type="tel"
                value={phoneDigitsOnly}
                onChange={handleSupportPhoneChange}
                placeholder="6363145972"
                maxLength={10}
                className="w-full bg-white px-3 py-2 text-xs text-[#142319] outline-hidden font-mono"
              />
            </div>
            <p className="text-[10px] text-[#8c978f] mt-1">Country code +91 is locked by default</p>
          </div>

          {/* Instagram Account */}
          <div>
            <label className="block text-xs font-semibold text-[#142319] mb-1">
              Instagram Account
            </label>
            <div className="flex rounded-xl overflow-hidden border border-[#ded7cb] focus-within:border-[#1c3624] focus-within:ring-1 focus-within:ring-[#1c3624]">
              <span className="bg-[#f0ece4] text-[#6b7770] px-3 py-2 text-xs font-mono font-bold select-none border-r border-[#ded7cb] flex items-center">
                @
              </span>
              <input
                type="text"
                value={settings.instagramHandle || 'varna_prints_'}
                onChange={(e) => {
                  const val = e.target.value.replace(/^@/, '').trim()
                  handleUpdate('instagramHandle', val)
                  handleUpdate('instagramUrl', `https://www.instagram.com/${val}/`)
                }}
                placeholder="varna_prints_"
                className="w-full bg-white px-3 py-2 text-xs text-[#142319] outline-hidden font-mono"
              />
            </div>
            <p className="text-[10px] text-[#8c978f] mt-1">Auto-syncs storefront Instagram links</p>
          </div>

          {/* Support Email */}
          <div>
            <label className="block text-xs font-semibold text-[#142319] mb-1">
              Official Email Desk
            </label>
            <input
              type="email"
              value={settings.supportEmail || 'varnaprints2026@gmail.com'}
              onChange={(e) => handleUpdate('supportEmail', e.target.value.trim())}
              placeholder="varnaprints2026@gmail.com"
              className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-xl px-3 py-2 text-xs text-[#142319] outline-hidden font-mono"
            />
            <p className="text-[10px] text-[#8c978f] mt-1">Auto-syncs storefront email &amp; mailto links</p>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#142319] mb-1">
              Studio Address
            </label>
            <input
              type="text"
              value={settings.studioAddress}
              onChange={(e) => handleUpdate('studioAddress', e.target.value)}
              className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-xl px-3 py-2 text-xs text-[#142319] outline-hidden"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-semibold text-[#142319] mb-1">
              Footer Copyright Notice
            </label>
            <input
              type="text"
              value={settings.copyrightText}
              onChange={(e) => handleUpdate('copyrightText', e.target.value)}
              className="w-full bg-white border border-[#ded7cb] focus:border-[#1c3624] rounded-xl px-3 py-2 text-xs text-[#142319] outline-hidden"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
