import { useCallback, useEffect, useRef, useState } from 'react'

import { PuckPropsPanel } from './PuckPropsPanel.tsx'
import styles from './DesignEditorLayout.module.css'

const STORAGE_KEY = 'designEditorSidebarWidth'
const MIN_WIDTH = 180

/**
 * Layout of the design editors: component drawer on the left (25% wide,
 * resizable by dragging the divider — the width is persisted), the page
 * preview in the middle, and the props panel for the selected component on
 * the right. Replaces Puck's default layout so the editors keep their own
 * chrome; everything between still runs inside Puck's context.
 */
export const DesignEditorLayout = ({
  sidebar,
  preview,
}: {
  sidebar: React.ReactNode
  preview: React.ReactNode
}) => {
  const [sidebarWidth, setSidebarWidth] = useState<number | null>(null)
  const layoutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = Number(localStorage.getItem(STORAGE_KEY))
    if (Number.isFinite(stored) && stored >= MIN_WIDTH) {
      setSidebarWidth(stored)
    }
  }, [])

  const onResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    const layout = layoutRef.current
    if (!layout) return
    const maxWidth = layout.clientWidth * 0.6
    const onMove = (ev: PointerEvent) => {
      const width = Math.min(
        Math.max(ev.clientX - layout.getBoundingClientRect().left, MIN_WIDTH),
        maxWidth,
      )
      setSidebarWidth(width)
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      setSidebarWidth((width) => {
        if (width != null) {
          localStorage.setItem(STORAGE_KEY, String(Math.round(width)))
        }
        return width
      })
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [])

  return (
    <div className={styles.layout} ref={layoutRef}>
      <div
        className={styles.sidebar}
        style={sidebarWidth != null ? { width: sidebarWidth } : undefined}
      >
        {sidebar}
      </div>
      {/* no role="separator": the app's global form CSS styles that role
          for form-section separators, which would break this resizer */}
      <div className={styles.splitter} onPointerDown={onResizeStart} />
      <div className={styles.preview}>{preview}</div>
      <PuckPropsPanel />
    </div>
  )
}
