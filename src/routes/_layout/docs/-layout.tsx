import { Outlet, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { DocsList } from '../../../formsAndLists/docs.tsx'

// Hysteresis thresholds to prevent jumping near the breakpoint
const WIDE_THRESHOLD = 1040
const NARROW_THRESHOLD = 960

const useIsWide = () => {
  const [isWide, setIsWide] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= WIDE_THRESHOLD,
  )

  useEffect(() => {
    const handler = () => {
      setIsWide((prev) => {
        const w = window.innerWidth
        if (prev && w < NARROW_THRESHOLD) return false
        if (!prev && w >= WIDE_THRESHOLD) return true
        return prev
      })
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return isWide
}

export const DocsLayout = () => {
  const isWide = useIsWide()
  const { docId } = useParams({ strict: false })
  const isOnIndex = !docId

  const showList = isWide || isOnIndex
  const showContent = isWide || !isOnIndex

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      {showList && (
        <div
          style={{
            width: isWide ? 280 : '100%',
            flexShrink: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            borderRight: isWide
              ? '1px solid var(--colorNeutralStroke1, #e0e0e0)'
              : undefined,
          }}
        >
          <DocsList />
        </div>
      )}
      {showContent && (
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Outlet />
        </div>
      )}
    </div>
  )
}
