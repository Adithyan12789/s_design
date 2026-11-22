'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, X, Check, Loader2 } from 'lucide-react'

interface ProjectFeedbackModalProps {
  open: boolean
  project: {
    id: string
    title: string
    slug?: string
    mainImage?: string
    category?: string
    location?: string
  }
  onClose: (didSubmit?: boolean) => void
}

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return ''
  const KEY = 's_designs_visitor_id'
  try {
    let id = localStorage.getItem(KEY)
    if (!id) {
      id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return `v_anon_${Date.now()}`
  }
}

export function ProjectFeedbackModal({
  open,
  project,
  onClose,
}: ProjectFeedbackModalProps) {
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setRating(0)
      setHoverRating(0)
      setFeedback('')
      setSubmitting(false)
      setSubmitted(false)
      setErrorMessage('')
    }
  }, [open])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const activeStarCount = hoverRating > 0 ? hoverRating : rating

  const ratingLabels = ['', 'Could be better', 'Fair', 'Good', 'Very Good', 'Exceptional']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating < 1 || rating > 5) return

    setSubmitting(true)
    setErrorMessage('')

    try {
      const visitorId = getOrCreateVisitorId()
      const res = await fetch('/api/project-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          rating,
          feedback,
          visitorId,
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review.')
      }

      setSubmitted(true)

      // Allow visitor to see success confirmation briefly, then continue navigation
      setTimeout(() => {
        onClose(true)
      }, 950)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-[#181715] border border-[#f4efe6]/15 shadow-2xl text-[#f4efe6] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Bronze Accent Top Line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#b68d54] to-transparent opacity-80" />

        {/* Close Button */}
        <button
          type="button"
          onClick={() => onClose(false)}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-[#8e8578] hover:text-[#f4efe6] hover:bg-white/5 transition-colors cursor-target"
          aria-label="Close dialog"
          suppressHydrationWarning
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          /* SUCCESS STATE */
          <div className="p-8 sm:p-10 text-center flex flex-col items-center justify-center min-h-[320px] animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-[#b68d54]/20 border border-[#b68d54]/40 flex items-center justify-center text-[#d9b686] mb-4">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl text-[#f4efe6] mb-2">Thank you</h3>
            <p className="text-sm text-[#a8a195] max-w-sm">
              Your perspective has been shared with the studio. Continuing your exploration...
            </p>
          </div>
        ) : (
          /* REVIEW FORM */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Modal Header */}
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#b68d54] font-mono mb-1">
                STUDIO INQUIRY &middot; PROJECT IMPRESSIONS
              </p>
              <h2
                id="feedback-modal-title"
                className="font-serif text-2xl sm:text-3xl text-[#f4efe6] tracking-tight leading-tight"
              >
                What did you think of this project?
              </h2>
              <p className="text-xs sm:text-sm text-[#9e9689] mt-1.5">
                We'd love to know how much you liked this design.
              </p>
            </div>

            {/* Project Mini-Card */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              {project.mainImage ? (
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-[#23211e]">
                  <Image
                    src={project.mainImage}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-lg bg-[#b68d54]/10 border border-[#b68d54]/20 flex items-center justify-center text-[#b68d54] shrink-0 font-serif text-lg">
                  S
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-mono text-[#b68d54] tracking-wider uppercase">
                  {project.category || 'Architecture Case Study'}
                </p>
                <h3 className="font-medium text-sm sm:text-base text-[#f4efe6] truncate">
                  {project.title}
                </h3>
              </div>
            </div>

            {/* Star Rating Selector */}
            <div className="space-y-2 text-center py-1">
              <div
                className="flex items-center justify-center gap-2"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= activeStarCount
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="p-1 sm:p-1.5 rounded-lg transition-transform hover:scale-115 active:scale-95 focus:outline-none cursor-target"
                      aria-label={`Rate ${star} out of 5 stars`}
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-200 ${
                          isFilled
                            ? 'fill-[#d9b686] text-[#d9b686] drop-shadow-[0_0_8px_rgba(217,182,134,0.45)]'
                            : 'text-[#44403a] hover:text-[#777065]'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>

              {/* Dynamic Rating Label */}
              <p className="text-xs font-mono tracking-wider text-[#b68d54] h-4 transition-all">
                {activeStarCount > 0 ? ratingLabels[activeStarCount] : 'Select your rating'}
              </p>
            </div>

            {/* Optional Feedback Textarea */}
            <div className="space-y-1.5">
              <label
                htmlFor="feedback-comment"
                className="block text-xs font-medium text-[#c5beb3]"
              >
                Notes or spatial impressions <span className="text-[#7c7367] font-normal">(Optional)</span>
              </label>
              <textarea
                id="feedback-comment"
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                maxLength={1000}
                placeholder="Share what caught your eye, or thoughts on the light, flow, and materiality..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-[#f4efe6] placeholder-[#6e675d] focus:outline-none focus:border-[#b68d54]/60 focus:ring-1 focus:ring-[#b68d54]/40 resize-none transition-colors"
              />
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-400 text-center">{errorMessage}</p>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => onClose(false)}
                className="px-4 py-2 text-xs uppercase tracking-wider font-mono text-[#8e8578] hover:text-[#f4efe6] transition-colors cursor-target"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={rating === 0 || submitting}
                className="px-6 py-2.5 rounded-full bg-[#b68d54] text-[#141311] font-medium text-xs tracking-wider uppercase transition-all duration-300 hover:bg-[#d9b686] hover:shadow-[0_0_20px_rgba(182,141,84,0.35)] disabled:opacity-35 disabled:cursor-not-allowed flex items-center gap-2 cursor-target"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
