import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className = '', style, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[#211f1c]/70 rounded ${className}`}
      style={{
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  )
}

/**
 * Skeleton for Homepage Project Cards (Work Horizontal Showcase)
 */
export function ProjectCardSkeleton() {
  return (
    <div className="w-[300px] sm:w-[380px] md:w-[460px] flex-shrink-0 aspect-[4/3] rounded-md bg-[#181614] border border-white/5 p-4 flex flex-col justify-end animate-pulse">
      <Skeleton className="h-4 w-24 mb-2 bg-[#2a2723]" />
      <Skeleton className="h-6 w-3/4 mb-3 bg-[#332f2b]" />
      <Skeleton className="h-3 w-1/2 bg-[#2a2723]" />
    </div>
  )
}

/**
 * Skeleton for Gallery Plate Media items (Project Details 02)
 */
export function GalleryPlateSkeleton({ isEven = true }: { isEven?: boolean }) {
  return (
    <div
      className={`w-full rounded-md bg-[#161513] border border-white/5 overflow-hidden animate-pulse ${
        isEven ? 'aspect-[3/4]' : 'aspect-[16/10]'
      }`}
      aria-hidden="true"
    >
      <div className="w-full h-full bg-[#1e1c19]/80 flex items-center justify-center">
        <Skeleton className="w-12 h-12 rounded-full bg-[#2a2723]" />
      </div>
    </div>
  )
}

/**
 * Skeleton for Client Reviews Section
 */
export function ReviewsSectionSkeleton() {
  return (
    <section className="reviews section-pad bg-[#141311] border-t border-[var(--line)] py-24 px-6 md:px-12 animate-pulse" aria-hidden="true">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <Skeleton className="h-3 w-28 mb-4 bg-[#2a2723]" />
        <Skeleton className="h-8 w-64 md:w-96 mb-12 bg-[#332f2b]" />
        <div className="w-full max-w-xl aspect-[16/9] rounded-lg bg-[#1c1a17] border border-white/5" />
      </div>
    </section>
  )
}

/**
 * Skeleton for Founder Section
 */
export function FounderSectionSkeleton() {
  return (
    <section className="section-pad bg-[#121110] border-t border-[var(--line)] py-24 px-6 md:px-12 animate-pulse" aria-hidden="true">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="aspect-[4/5] rounded-lg bg-[#1a1816] border border-white/5" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-3 w-24 bg-[#2a2723]" />
          <Skeleton className="h-8 w-3/4 bg-[#332f2b]" />
          <Skeleton className="h-4 w-full bg-[#24211e]" />
          <Skeleton className="h-4 w-5/6 bg-[#24211e]" />
          <Skeleton className="h-4 w-2/3 bg-[#24211e]" />
        </div>
      </div>
    </section>
  )
}
