import { useCallback, useRef, useState, useEffect } from 'react'
import { useResizeDetector } from 'react-resize-detector'
import { InlineDrawer, Button } from '@fluentui/react-components'
import { BiSolidLeftArrow, BiSolidRightArrow } from 'react-icons/bi'
import { useAnimate } from 'framer-motion'
import { useAtomValue } from 'jotai'

import { Content } from './Content.tsx'
import { Resizer } from './Resizer.tsx'
import { mapHideUiAtom } from '../../../store.ts'
import styles from './index.module.css'

export const LeftMenuDrawer = ({ isNarrow }) => {
  const mapHideUi = useAtomValue(mapHideUiAtom)

  const {
    width: ownWidth,
    height: ownHeight,
    ref: widthRef,
  } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 100,
    refreshOptions: { leading: false, trailing: true },
  })
  const [size, setSize] = useState(isNarrow ? 500 : 380)
  // when width falls below 40, set sidebarSize to 5
  // TODO: only react to dragend?
  useEffect(() => {
    if ((isNarrow && ownHeight <= 40) || (!isNarrow && ownWidth <= 40)) {
      setSize(5)
    }
  }, [isNarrow, ownHeight, ownWidth])

  const isOpen = size > 40
  const toggleOpen = (e) => {
    e.stopPropagation()
    const newValue = isOpen ? 5 : isNarrow ? 500 : 380
    setSize(newValue)
  }

  const animationFrame = useRef<number>(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)

  // why do we need wasResizing?
  // without it, after resizing the drawer, the animation will run
  const wasResizing = useRef(false)
  const startResizing = () => {
    setIsResizing(true)
    wasResizing.current = true
  }
  const stopResizing = useCallback(() => {
    setIsResizing(false)
    setTimeout(() => (wasResizing.current = false), 500)
  }, [])

  const resize = useCallback(
    ({ clientX, clientY }) => {
      if (!isResizing) return
      if (!sidebarRef.current) return

      const newSidebarSize = isNarrow
        ? window.innerHeight - clientY
        : clientX - sidebarRef.current.getBoundingClientRect().left

      animationFrame.current = requestAnimationFrame(() =>
        setSize(newSidebarSize),
      )
    },
    [isNarrow, isResizing],
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

  // animate opening and closing of the drawer
  const [scope, animate] = useAnimate()
  useEffect(() => {
    if (isResizing) return
    if (wasResizing.current) return
    // if mapHideUi is true, we dont want to animate as the element does not exist
    if (mapHideUi) return
    // This "li" selector will only select children
    // of the element that receives `scope`.
    animate('.map-layers-drawer', isNarrow ? { height: size } : { width: size })
  }, [animate, isNarrow, isResizing, mapHideUi, size, wasResizing])

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
      className={styles.container}
      // dragging can mark text so we disable pointer events
      style={isResizing ? { pointerEvents: 'none' } : {}}
      ref={widthRef}
    >
      <div className={styles.innerContainer} ref={scope}>
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
            style={{
              position: 'absolute',
              top: isNarrow ? (isOpen ? 6 : -31) : 5,
              right: isNarrow ? 'unset' : isOpen ? 0.5 : -31.5,
              left: isNarrow ? 5 : 'unset',
              marginRight: isOpen ? 5 : 0,
              zIndex: 100000000,
              borderTopLeftRadius: isNarrow ? (isOpen ? 0 : 4) : isOpen ? 4 : 0,
              borderBottomLeftRadius: isNarrow
                ? isOpen
                  ? 4
                  : 0
                : isOpen
                  ? 4
                  : 0,
              borderTopRightRadius: isNarrow
                ? isOpen
                  ? 0
                  : 4
                : isOpen
                  ? 0
                  : 4,
              borderBottomRightRadius: isNarrow
                ? isOpen
                  ? 4
                  : 0
                : isOpen
                  ? 0
                  : 4,
            }}
          />
        )}
        <InlineDrawer
          open={!mapHideUi}
          className={`map-layers-drawer ${styles.drawer}`}
          ref={sidebarRef}
          style={{
            ...(isNarrow ? { height: size } : { width: size }),
          }}
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
