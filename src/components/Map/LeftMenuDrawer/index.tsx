import { useCallback, useRef, useState, useEffect } from 'react'
import * as fluentUiReactComponents from '@fluentui/react-components'
const { InlineDrawer, Button } = fluentUiReactComponents
import { BiSolidLeftArrow, BiSolidRightArrow } from 'react-icons/bi'
import { useAtomValue } from 'jotai'

import { Content } from './Content.tsx'
import { Resizer } from './Resizer.tsx'
import { mapHideUiAtom } from '../../../store.ts'
import { useElementSize } from '../../../modules/useElementSize.ts'
import styles from './index.module.css'

// isNarrow is undefined until MapContainer has measured the map's width,
// which happens right after the commit the drawer mounts in
type Props = { isNarrow: boolean | undefined; mapHeight?: number }

// map space kept visible above the narrow drawer: the only close
// toggle sits at the drawer's top edge (6px offset, ~31px tall), so
// the drawer must never grow past the map container's top
const narrowTopSliver = 60

// closed: only the toggle stays reachable
const closedSize = 5

export const LeftMenuDrawer = ({
  isNarrow: measuredNarrow,
  mapHeight,
}: Props) => {
  // the commit before the measurement is never painted (the drawer is
  // hidden for it, see .unmeasured)
  const isNarrow = measuredNarrow ?? false
  const mapHideUi = useAtomValue(mapHideUiAtom)

  const {
    width: ownWidth,
    height: ownHeight,
    ref: widthRef,
  } = useElementSize<HTMLDivElement>({ delay: 100 })
  // the default follows the map's width: closed on narrow maps, where it
  // would cover most of the map. It applies until a size is set explicitly
  // — by the toggle, a drag or the clamps below — which then survives
  // narrow ↔ wide changes
  const [chosenSize, setChosenSize] = useState<number | null>(null)
  const size = chosenSize ?? (isNarrow ? closedSize : 380)
  // when width falls below 40, set sidebarSize to 5
  useEffect(() => {
    if ((isNarrow && ownHeight! <= 40) || (!isNarrow && ownWidth! <= 40)) {
      const id = requestAnimationFrame(() =>
        // the measured size trails the drawer by the debounce — it arrives
        // ~100ms after a close animation. Leave alone what is closed since
        // (that keeps the closed default a default) or was opened again
        setChosenSize((chosenSize) =>
          chosenSize === null || chosenSize === closedSize || chosenSize > 40 ?
            chosenSize
          : closedSize,
        ),
      )
      return () => cancelAnimationFrame(id)
    }
  }, [isNarrow, ownHeight, ownWidth])

  const maxNarrowSize =
    mapHeight === undefined ?
      undefined
    : Math.max(mapHeight - narrowTopSliver, 120)
  const clampNarrow = useCallback(
    (size: number) => Math.min(size, maxNarrowSize ?? Number.POSITIVE_INFINITY),
    [maxNarrowSize],
  )
  // re-clamp when the map container shrinks (rotating the phone,
  // toggling the map fullscreen): a drawer opened tall must not
  // keep its top outside the map area
  useEffect(() => {
    if (isNarrow && maxNarrowSize !== undefined && size > maxNarrowSize) {
      setChosenSize(maxNarrowSize)
    }
  }, [isNarrow, maxNarrowSize, size])

  const isOpen = size > 40
  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newValue = isOpen ? closedSize : clampNarrow(isNarrow ? 500 : 380)
    setChosenSize(newValue)
  }

  const animationFrame = useRef<number>(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)

  const startResizing = () => {
    setIsResizing(true)
  }
  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback(
    ({ clientX, clientY }: MouseEvent) => {
      if (!isResizing) return
      if (!sidebarRef.current) return

      // narrow: anchor at the map container's bottom edge, not the
      // window's: the map starts below header and breadcrumbs
      const draggedSize =
        isNarrow ?
          clampNarrow(
            (widthRef.current?.parentElement?.getBoundingClientRect().bottom ??
              window.innerHeight) - clientY,
          )
        : clientX - sidebarRef.current.getBoundingClientRect().left
      // never below the closed sliver: dragged past the map's edge the size
      // went negative, which counts as 'auto' — the drawer showed at its
      // content width while its toggle offered to open it
      const newSidebarSize = Math.max(closedSize, draggedSize)

      animationFrame.current = requestAnimationFrame(() =>
        setChosenSize(newSidebarSize),
      )
    },
    [clampNarrow, isNarrow, isResizing, widthRef],
  )

  // while resizing, cursor needs to be:
  // row-resize (narrow) or col-resize (wide)
  // but it is: grab, because mouse leaves the resizer
  useEffect(() => {
    if (isResizing) {
      document
        ?.getElementsByClassName('map-container')?.[0]
        ?.classList.add(isNarrow ? 'row-resize' : 'col-resize')
    } else {
      document
        ?.getElementsByClassName('map-container')?.[0]
        ?.classList.remove('row-resize', 'col-resize')
    }

    return () => {
      document
        ?.getElementsByClassName('map-container')?.[0]
        ?.classList.remove('row-resize', 'col-resize')
    }
  }, [isResizing, isNarrow])

  useEffect(() => {
    window.addEventListener('mousemove', resize)
    // these events cant be added to the resizer's events
    // because on dragging the mouse immediately leaves the resizer
    window.addEventListener('mouseup', stopResizing)
    window.addEventListener('mouseleave', stopResizing)

    return () => {
      cancelAnimationFrame(animationFrame.current)
      window.removeEventListener('mousemove', resize)
      window.removeEventListener('mouseup', stopResizing)
      window.removeEventListener('mouseleave', stopResizing)
    }
  }, [resize, stopResizing])

  return (
    <div
      className={`${styles.container}${measuredNarrow === undefined ? ` ${styles.unmeasured}` : ''}${isResizing ? ` ${styles.dragging}` : ''}`}
      // dragging can mark text so we disable pointer events
      ref={widthRef}
    >
      <div className={styles.innerContainer}>
        {!mapHideUi && (
          <Button
            onClick={toggleOpen}
            icon={
              isOpen ? (
                <BiSolidLeftArrow className={styles.icon} />
              ) : (
                <BiSolidRightArrow className={styles.icon} />
              )
            }
            title={isOpen ? 'Close Layer Menu' : 'Open Layer Menu'}
            className={`${styles.toggleButton}${isNarrow ? (isOpen ? ` ${styles.toggleButtonNarrowOpen}` : ` ${styles.toggleButtonNarrowClosed}`) : isOpen ? ` ${styles.toggleButtonWideOpen}` : ` ${styles.toggleButtonWideClosed}`}`}
          />
        )}
        <InlineDrawer
          open={!mapHideUi}
          className={`map-layers-drawer ${styles.drawer}${isNarrow ? ` ${styles.drawerNarrow}` : ` ${styles.drawerWide}`}`}
          ref={sidebarRef}
          style={{ '--left-drawer-size': `${size}px` } as React.CSSProperties}
          position={isNarrow ? 'bottom' : 'start'}
          onMouseDown={(e) => isResizing && e.preventDefault()}
        >
          <Content />
          <Resizer startResizing={startResizing} isResizing={isResizing} />
        </InlineDrawer>
      </div>
    </div>
  )
}
