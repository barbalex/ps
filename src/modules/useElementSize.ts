import { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

type Size = { width?: number; height?: number }

// observes the element the returned ref is attached to with a native
// ResizeObserver and exposes its content-box size, debounced (trailing
// edge) to avoid rerendering on every intermediate size during a drag
// or window resize; with height: false, size changes are only picked
// up when the width changes
export const useElementSize = <E extends HTMLElement>({
  delay = 100,
  height = true,
}: {
  delay?: number
  height?: boolean
} = {}) => {
  const ref = useRef<E | null>(null)
  const [size, setSize] = useState<Size>({})

  const handleResize = useDebouncedCallback((entry: ResizeObserverEntry) => {
    const next = {
      width: entry.contentRect.width,
      height: entry.contentRect.height,
    }
    setSize((prev) =>
      prev.width !== next.width || (height && prev.height !== next.height)
        ? next
        : prev,
    )
  }, delay)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) handleResize(entry)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [handleResize])

  return { ref, ...size }
}
