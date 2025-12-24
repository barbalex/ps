import { useRef } from 'react'

import { Map } from './Map.tsx'
import { RightMenuDrawer } from './RightMenuDrawer/index.tsx'
import { LeftMenuDrawer } from './LeftMenuDrawer/index.tsx'

import styles from './index.module.css'

export const MapContainer = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className={styles.container} ref={containerRef}>
      <LeftMenuDrawer containerRef={containerRef} />
      <Map />
      <RightMenuDrawer containerRef={containerRef} />
    </div>
  )
}
