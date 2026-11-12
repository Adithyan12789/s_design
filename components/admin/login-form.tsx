'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react'
import { BrandLogo } from '@/components/brand-logo'

interface LoginFormProps {
  isConfigured: boolean
  configError?: string | null
  studioName?: string
  studioSubtitle?: string
  lightLogoUrl?: string
}

export function LoginForm({
  isConfigured,
  configError,
  studioName,
  studioSubtitle,
  lightLogoUrl,
}: LoginFormProps) {
  const router = useRouter()
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  async function submitCode(code: string) {
    if (!isConfigured) {
      setError(configError || 'ADMIN_ACCESS_CODE is not configured on the server.')
      return
    }
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error || 'Incorrect security code. Please try again.')
        setDigits(['', '', '', '', '', ''])
        setLoading(false)
        requestAnimationFrame(() => inputRefs.current[0]?.focus())
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Unable to verify security code. Please try again.')
      setLoading(false)
    }
  }

  function handleDigitChange(index: number, rawValue: string) {
    if (loading) return
    const cleaned = rawValue.replace(/\D/g, '')
    if (!cleaned) {
      const next = [...digits]
      next[index] = ''
      setDigits(next)
      return
    }

    // Handle multi-digit input (e.g. mobile autofill or paste into a single box)
    if (cleaned.length > 1) {
      const next = [...digits]
      for (let i = 0; i < 6 - index && i < cleaned.length; i++) {
        next[index + i] = cleaned[i]
      }
      setDigits(next)
      const joined = next.join('')
      if (joined.length === 6) {
        submitCode(joined)
      } else {
        const nextEmpty = next.findIndex((d) => !d)
        if (nextEmpty !== -1) inputRefs.current[nextEmpty]?.focus()
      }
      return
    }

    const next = [...digits]
    next[index] = cleaned
    setDigits(next)
    setError(null)

    if (index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    const fullCode = next.join('')
    if (fullCode.length === 6 && next.every((d) => /^\d$/.test(d))) {
      submitCode(fullCode)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (loading) return

    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = [...digits]
      if (next[index]) {
        next[index] = ''
        setDigits(next)
      } else if (index > 0) {
        next[index - 1] = ''
        setDigits(next)
        inputRefs.current[index - 1]?.focus()
      }
      return
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    if (loading) return
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()

    const next = ['', '', '', '', '', '']
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i]
    }
    setDigits(next)
    setError(null)

    if (pasted.length === 6) {
      inputRefs.current[5]?.focus()
      submitCode(pasted)
    } else {
      inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#141311] px-4 py-12 text-[#faf8f5]">
      <div className="w-full max-w-md rounded-2xl bg-[#1a1815] border border-[#b68d54]/25 shadow-2xl overflow-hidden">
        <div className="px-8 pt-9 pb-6 border-b border-[#b68d54]/15 flex flex-col items-center text-center">
          <div className="mb-6">
            <BrandLogo
              href="/"
              variant="glass"
              size="md"
              studioName={studioName}
              studioSubtitle={studioSubtitle}
              lightLogoUrl={lightLogoUrl}
            />
          </div>

          <p className="text-[10px] uppercase tracking-[0.3em] text-[#d9b686] font-medium">
            Studio Management System
          </p>
          <h1 className="admin-serif text-3xl sm:text-4xl text-[#faf8f5] mt-2 font-normal tracking-wide">
            ADMIN ACCESS
          </h1>
          <p className="text-xs sm:text-sm text-[#e7e1d6]/70 mt-2">
            Enter your 6-digit security code to continue.
          </p>
        </div>

        <div className="px-8 py-8 space-y-6">
          {!isConfigured && (
            <div className="flex items-start gap-2.5 rounded-lg bg-amber-950/60 border border-amber-500/40 px-3.5 py-3 text-xs text-amber-200">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" />
              <div>
                <p className="font-semibold text-amber-100">Security Code Not Configured</p>
                <p className="mt-0.5 text-amber-200/80">
                  Set <code className="text-amber-100">ADMIN_ACCESS_CODE</code> (6 digits) in your
                  server environment variables (<code>.env.local</code> or Vercel) and restart.
                </p>
              </div>
            </div>
          )}

          <div
            className="flex items-center justify-center gap-2.5 sm:gap-3"
            role="group"
            aria-label="6-digit security access code"
          >
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el
                }}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                aria-label={`Security code digit ${idx + 1}`}
                disabled={loading || !isConfigured}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                className={`w-11 h-14 sm:w-12 sm:h-15 text-center text-xl font-semibold rounded-lg bg-[#12110f] text-[#faf8f5] border transition-all focus:outline-none ${
                  error
                    ? 'border-red-400/70 focus:border-red-400'
                    : digit
                      ? 'border-[#b68d54] shadow-[0_0_0_1px_rgba(182,141,84,0.3)]'
                      : 'border-[#e7e1d6]/20 focus:border-[#d9b686]'
                } disabled:opacity-50`}
              />
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-xs text-[#d9b686] tracking-wider uppercase">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying access code...</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg bg-red-950/60 border border-red-500/40 px-3.5 py-3 text-xs text-red-200"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-[#e7e1d6]/50">
            <ShieldCheck className="w-3.5 h-3.5 text-[#b68d54]" />
            <span>Protected by server-side verification &amp; HTTP-only session</span>
          </div>
        </div>
      </div>
    </div>
  )
}
