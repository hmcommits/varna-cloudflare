'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useStore } from '@/context/StoreContext'
import { Lock, ArrowRight, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const { store } = useStore()
  const [passcode, setPasscode] = useState('')
  const [showPasscode, setShowPasscode] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deviceRemembered, setDeviceRemembered] = useState(false)

  // Prefetch admin dashboard immediately so entry is instantaneous
  useEffect(() => {
    router.prefetch('/admin')
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const isLoggedOut = params.get('logged_out') === '1'
      const isRemembered =
        localStorage.getItem('varna_remember_device') === 'true' &&
        Boolean(localStorage.getItem('varna_admin_token'))

      setDeviceRemembered(isRemembered)

      if (isRemembered && !isLoggedOut) {
        const token = localStorage.getItem('varna_admin_token') || ''
        sessionStorage.setItem('varna_admin_session', 'true')
        sessionStorage.setItem('varna_admin_token', token)
        document.cookie = `varna_admin_session=authenticated; path=/; max-age=31536000; SameSite=Lax`
        router.replace('/admin')
      }
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    try {
      // Server-side verification — sets HttpOnly cookie for Edge Middleware
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      })

      if (res.ok) {
        const data = await res.json()
        if (typeof window !== 'undefined') {
          const token = data.token || passcode.trim()
          sessionStorage.setItem('varna_admin_session', 'true')
          sessionStorage.setItem('varna_admin_token', token)
          localStorage.setItem('varna_admin_authenticated', 'true')
          if (rememberMe) {
            localStorage.setItem('varna_remember_device', 'true')
            localStorage.setItem('varna_admin_token', token)
            document.cookie = `varna_admin_session=authenticated; path=/; max-age=31536000; SameSite=Lax`
          } else {
            localStorage.removeItem('varna_remember_device')
            localStorage.removeItem('varna_admin_token')
            document.cookie = `varna_admin_session=authenticated; path=/; max-age=86400; SameSite=Lax`
          }
        }
        router.push('/admin')
      } else {
        setError(true)
        setLoading(false)
      }
    } catch {
      // Fallback: client-side check against store passcode (offline/local dev)
      const masterPasscode = store.settings?.passcode || 'varna2026'
      if (passcode.trim() === masterPasscode) {
        if (typeof window !== 'undefined') {
          const token = passcode.trim()
          sessionStorage.setItem('varna_admin_session', 'true')
          sessionStorage.setItem('varna_admin_token', token)
          localStorage.setItem('varna_admin_authenticated', 'true')
          if (rememberMe) {
            localStorage.setItem('varna_remember_device', 'true')
            localStorage.setItem('varna_admin_token', token)
            document.cookie = `varna_admin_session=authenticated; path=/; max-age=31536000; SameSite=Lax`
          } else {
            localStorage.removeItem('varna_remember_device')
            localStorage.removeItem('varna_admin_token')
            document.cookie = `varna_admin_session=authenticated; path=/; max-age=86400; SameSite=Lax`
          }
        }
        router.push('/admin')
      } else {
        setError(true)
        setLoading(false)
      }
    }
  }

  const logoSrc =
    store.settings?.logoUrl ||
    '/images/logo/varna-logo.webp'

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#142319] flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#eef7f0]/80 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#fcf5e9]/90 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Bar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between z-10">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-[#6b7770] hover:text-[#142319] transition-colors font-medium py-2"
        >
          <ArrowLeft size={14} />
          <span>Back to Storefront</span>
        </Link>
        <span className="text-[10px] tracking-widest uppercase text-[#845d1d] font-mono bg-white border border-[#ded7cb] px-3 py-1 rounded-full shadow-2xs font-bold">
          Single Entrypoint Authenticator
        </span>
      </div>

      {/* Centered Login Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10">
        <div className="bg-white border border-[#ebe5da] rounded-3xl p-6 sm:p-8 shadow-xl">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="relative h-18 sm:h-22 aspect-[831/469] mx-auto mb-4">
              <Image
                src={logoSrc}
                alt="Varna"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#142319] tracking-tight">
              Varna Command Vault
            </h1>
            <p className="text-xs text-[#6b7770] mt-1">
              Authorized Personnel Storefront Management
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#142319] mb-1.5 uppercase tracking-wider">
                Master Security Passcode
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value)
                    setError(false)
                  }}
                  placeholder="Enter vault passcode..."
                  autoFocus
                  required
                  className={`w-full bg-white border rounded-xl py-3 pl-10 pr-11 text-sm text-[#142319] placeholder-[#8c978f] focus:outline-hidden transition-all ${
                    error
                      ? 'border-red-500 ring-2 ring-red-500/20'
                      : 'border-[#ded7cb] focus:border-[#1c3624] focus:ring-1 focus:ring-[#1c3624]'
                  }`}
                />
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#845d1d]"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c978f] hover:text-[#142319] transition-colors p-1.5 rounded-lg hover:bg-[#faf6f0] cursor-pointer"
                  title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                  aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="text-xs text-[#b84840] mt-1.5 font-medium flex items-center gap-1">
                  <span>Invalid passcode. Please verify and try again.</span>
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md border-[#ded7cb] text-[#1c3624] focus:ring-[#1c3624] accent-[#1c3624] cursor-pointer"
                />
                <span className="text-xs font-semibold text-[#142319]">
                  Remember Me on this device
                </span>
              </label>
              <span className="text-[10px] text-[#6b7770]">
                5-tap logo auto-login
              </span>
            </div>

            {deviceRemembered && (
              <div className="flex items-center justify-between text-[11px] text-[#206035] bg-[#eef7f0] border border-[#d6ecda] px-3 py-1.5 rounded-xl">
                <span>✓ This device is remembered</span>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('varna_remember_device')
                    localStorage.removeItem('varna_admin_token')
                    setDeviceRemembered(false)
                  }}
                  className="text-[10px] text-[#b84840] hover:underline font-semibold cursor-pointer"
                >
                  Forget device
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#1c3624] hover:bg-[#14281a] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Unlock Command Vault'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Security badge footer */}
        <div className="text-center mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#6b7770]">
          <ShieldCheck size={14} className="text-[#206035]" />
          <span>Varna Direct WhatsApp Concierge Architecture • Next.js 14</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full text-center text-[10px] text-[#8c978f] py-2 z-10 font-mono">
        VARNA PROTOCOL SECURE ENCLAVE
      </div>
    </div>
  )
}
