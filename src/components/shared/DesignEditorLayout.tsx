import { useCallback, useEffect, useRef, useState } from 'react'

import { PuckPropsPanel } from './PuckPropsPanel.tsx'
import styles from './DesignEditorLayout.module.css'

const SIDEBAR_STORAGE_KEY = 'designEditorSidebarWidth'
const PANEL_STORAGE_KEY = 'designEditorPanelWidth'
const MIN_SIDEBAR_WIDTH = 180
const MIN_PANEL_WIDTH = 240

/**
 * Layout of the design editors: component drawer on the left (25% wide),
 * the page preview in the middle, and the props panel for the selected
 * component on the right. Both dividers are draggable; the widths are
 * persisted per column. Replaces Puck's default layout so the editors keep
 * their own chrome; everything between still runs inside Puck's context.
 */
export const DesignEditorLayout = ({
  sidebar,
  preview,
}: {
  sidebar: React.ReactNode
  preview: React.ReactNode
}) => {
  const [sidebarWidth, setSidebarWidth] = useState<number | null>(null)
  const [panelWidth, setPanelWidth] = useState<number | null>(null)
  const layoutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const restore = (key: string, min: number) => {
      const stored = Number(localStorage.getItem(key))
      return Number.isFinite(stored) && stored >= min ? stored : null
    }
    setSidebarWidth(restore(SIDEBAR_STORAGE_KEY, MIN_SIDEBAR_WIDTH))
    setPanelWidth(restore(PANEL_STORAGE_KEY, MIN_PANEL_WIDTH))
  }, [])

  const startResize = useCallback(
    (options: {
      min: number
      maxRatio: number
      computeWidth: (clientX: number, rect: DOMRect) => number
      setWidth: React.Dispatch<React.SetStateAction<number | null>>
      storageKey: string
    }) => {
      return (e: React.PointerEvent) => {
        e.preventDefault()
        const layout = layoutRef.current
        if (!layout) return
        const max = layout.clientWidth * options.maxRatio
        const onMove = (ev: PointerEvent) => {
          const width = Math.min(
            Math.max(
              options.computeWidth(ev.clientX, layout.getBoundingClientRect()),
              options.min,
            ),
            max,
          )
          options.setWidth(width)
        }
        const onUp = () => {
          window.removeEventListener('pointermove', onMove)
          window.removeEventListener('pointerup', onUp)
          document.body.style.cursor = ''
          document.body.style.userSelect = ''
          options.setWidth((width) => {
            if (width != null) {
              localStorage.setItem(options.storageKey, String(Math.round(width)))
            }
            return width
          })
        }
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
      }
    },
    [],
  )

  const onSidebarResize = startResize({
    min: MIN_SIDEBAR_WIDTH,
    maxRatio: 0.5,
    computeWidth: (clientX, rect) => clientX - rect.left,
    setWidth: setSidebarWidth,
    storageKey: SIDEBAR_STORAGE_KEY,
  })

  const onPanelResize = startResize({
    min: MIN_PANEL_WIDTH,
    maxRatio: 0.45,
    computeWidth: (clientX, rect) => rect.right - clientX,
    setWidth: setPanelWidth,
    storageKey: PANEL_STORAGE_KEY,
  })

  return (
    <div className={styles.layout} ref={layoutRef}>
      <div
        className={styles.sidebar}
        style={sidebarWidth != null ? { width: sidebarWidth } : undefined}
      >
        {sidebar}
      </div>
      {/* no role="separator" on the dividers: the app's global form CSS
          styles that role for form-section separators, which would break
          them */}
      <div className={styles.splitter} onPointerDown={onSidebarResize} />
      <div className={styles.preview}>{preview}</div>
      <div className={styles.splitter} onPointerDown={onPanelResize} />
      <div
        className={styles.panelCol}
        style={panelWidth != null ? { width: panelWidth } : undefined}
      >
        <PuckPropsPanel />
      </div>
    </div>
  )
}
