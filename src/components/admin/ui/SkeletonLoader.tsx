'use client'

import { useEffect, useState } from 'react'

interface SkeletonLoaderProps {
  /** Minimum time to show skeleton (ms). Default 2000 */
  minDuration?: number
  /** Whether data is still loading */
  loading?: boolean
  children: React.ReactNode
  /** Custom skeleton UI. If omitted, uses a generic dark skeleton */
  skeleton?: React.ReactNode
  className?: string
}

/**
 * Professional skeleton loader that shows for at least `minDuration` ms
 * even if data loads faster — improves perceived quality.
 */
export default function SkeletonLoader({
  minDuration = 2000,
  loading = true,
  children,
  skeleton,
  className = '',
}: SkeletonLoaderProps) {
  const [showSkeleton, setShowSkeleton] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const start = Date.now()
    let timer: ReturnType<typeof setTimeout> | null = null

    if (!loading) {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, minDuration - elapsed)
      timer = setTimeout(() => {
        setShowSkeleton(false)
        setReady(true)
      }, remaining)
    } else {
      setShowSkeleton(true)
      setReady(false)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [loading, minDuration])

  // When loading becomes false, wait out remaining min duration
  useEffect(() => {
    if (loading) return
    const t = setTimeout(() => {
      setShowSkeleton(false)
      setReady(true)
    }, minDuration)
    return () => clearTimeout(t)
  }, [loading, minDuration])

  if (showSkeleton || !ready) {
    if (skeleton) return <>{skeleton}</>
    return (
      <div className={`animate-pulse space-y-4 ${className}`} aria-busy="true" aria-label="Loading">
        <div className="h-8 bg-white/10 rounded-lg w-1/3" />
        <div className="h-4 bg-white/5 rounded w-2/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
              <div className="h-4 bg-white/10 rounded w-1/2" />
              <div className="h-8 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-full" />
            </div>
          ))}
        </div>
        <div className="space-y-3 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return <>{children}</>
}

/** Simple full-page skeleton for route transitions */
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto animate-pulse space-y-6">
        <div className="h-10 bg-white/10 rounded-lg w-48 sm:w-64" />
        <div className="h-4 bg-white/5 rounded w-full max-w-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="aspect-video bg-white/10" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-8 bg-white/10 rounded w-1/3 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Card grid skeleton */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/2" />
          <div className="h-8 bg-white/10 rounded w-2/3" />
          <div className="h-3 bg-white/5 rounded w-full" />
        </div>
      ))}
    </div>
  )
}

/** Table / list row skeleton */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 sm:h-14 bg-white/5 border border-white/10 rounded-xl" />
      ))}
    </div>
  )
}
