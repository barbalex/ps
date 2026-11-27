import { useLayoutEffect, useState } from 'react'

import { useElementSize } from '../../modules/useElementSize.ts'

import { Map } from './Map.tsx'
import { ProjectAreas } from './ProjectAreas.tsx'
import { RightMenuDrawer } from './RightMenuDrawer/index.tsx'
import { LeftMenuDrawer } from './LeftMenuDrawer/index.tsx'

import styles from './index.module.css'

const isNarrowWidth = (width: number) => width < 700

export const MapContainer = () => {
  const {
    ref: containerRef,
    width: containerWidth,
    height: containerHeight,
  } = useElementSize<HTMLDivElement>({ delay: 100 })
  // width is undefined before the first resize event (the hook debounces by
  // 100ms): until then it is unknown whether the map is narrow
  const isNarrow =
    containerWidth === undefined ? undefined : isNarrowWidth(containerWidth)
  // the layer drawer starts closed on narrow maps and must know so from its
  // first frame — with the wide styles it covers the whole map. So measure
  // once, before the browser paints. The drawer mounts with that first
  // commit like before (hidden until measured, see LeftMenuDrawer): mounting
  // it later reordered its effects against the map's and reverted a stored
  // background choice to the default
  const [isNarrowAtMount, setIsNarrowAtMount] = useState<boolean>()
  useLayoutEffect(() => {
    setIsNarrowAtMount(
      isNarrowWidth(containerRef.current?.clientWidth ?? Infinity),
    )
  }, [containerRef])

  return (
    <div
      className={styles.container}
      ref={containerRef}
    >
      <ProjectAreas>
      <LeftMenuDrawer
        // undefined until measured: only for the first commit
        isNarrow={isNarrow ?? isNarrowAtMount}
        mapHeight={containerHeight}
      />
      <Map />
      {/* keeps the delayed value: the info drawer fixes its size at mount
          and has always mounted with the one for wide maps */}
      <RightMenuDrawer isNarrow={isNarrow ?? false} />
      </ProjectAreas>
    </div>
  )
}
