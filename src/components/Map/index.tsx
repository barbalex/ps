import { useRef } from 'react'
import { useResizeDetector } from 'react-resize-detector'

import { Map } from './Map.tsx'
import { RightMenuDrawer } from './RightMenuDrawer/index.tsx'
import { LeftMenuDrawer } from './LeftMenuDrawer/index.tsx'

import styles from './index.module.css'

export const MapContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { width: containerWidth } = useResizeDetector({
    targetRef: containerRef,
    handleHeight: false,
    refreshMode: 'debounce',
    refreshRate: 100,
    refreshOptions: { leading: false, trailing: true },
  })
  // width is undefined before the first resize event;
  // undefined < 700 evaluates to false, same as before
  const isNarrow = (containerWidth as number) < 700

  return (
    <div
      className={styles.container}
      ref={containerRef}
    >
      <LeftMenuDrawer isNarrow={isNarrow} />
      <Map />
      <RightMenuDrawer isNarrow={isNarrow} />
    </div>
  )
}
