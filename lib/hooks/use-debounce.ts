'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Custom hook to debounce a fast-changing value (such as a search input string)
 * by a specified delay (default 280ms).
 */
export function useDebounce<T>(value: T, delayMs = 280): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delayMs)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delayMs])

  return debouncedValue
}

/**
 * Custom hook to create a debounced callback that cleans up automatically on unmount.
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delayMs = 280
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef<T>(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => cancel()
  }, [cancel])

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      cancel()
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delayMs)
    },
    [delayMs, cancel]
  ) as ((...args: Parameters<T>) => void) & { cancel: () => void }

  debouncedFn.cancel = cancel
  return debouncedFn
}
