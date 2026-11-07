import { useElementSize } from '../../modules/useElementSize.ts'

import { Map } from './Map.tsx'
import { RightMenuDrawer } from './RightMenuDrawer/index.tsx'
import { LeftMenuDrawer } from './LeftMenuDrawer/index.tsx'

import styles from './index.module.css'

export const MapContainer = () => {
  const {
    ref: containerRef,
    width: containerWidth,
  } = useElementSize<HTMLDivElement>({ delay: 100, height: false })
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
