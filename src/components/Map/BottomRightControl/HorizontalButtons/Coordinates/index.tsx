import { useState } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'
import type { Map as LeafletMap, LatLng } from 'leaflet'
import { useMapCoordinatesCrs } from '../../../../../modules/useMapCoordinatesCrs.ts'

import { ToggleMapCenter } from './ToggleMapCenter.tsx'
import { ChooseCrs } from './ChooseCrs.tsx'
import { epsgFrom4326 } from '../../../../../modules/epsgFrom4326.ts'
import { round } from '../../../../../modules/roundCoordinates.ts'
import { Inputs } from './Inputs.tsx'
import styles from './index.module.css'

const getCoordinates = ({
  map,
  center,
  crs,
}: {
  map?: LeafletMap | null
  center?: LatLng | null
  crs: ReturnType<typeof useMapCoordinatesCrs>
}) => {
  if (!map) return null
  if (!center) return null
  const [x, y] = epsgFrom4326({
    x: center.lng,
    y: center.lat,
    projectMapPresentationCrs: crs?.code,
    crs: { code: crs?.code, proj4: crs?.projection },
  })
  return { x: round(x!), y: round(y!) }
}

export const CoordinatesControl = () => {
  const map = useMap()
  const bounds = map.getBounds()
  const center = bounds.getCenter()
  const crs = useMapCoordinatesCrs()

  const [, setRenderCount] = useState(0)
  const rerender = () => setRenderCount((prev) => prev + 1)

  const coordinates = getCoordinates({
    map,
    center,
    crs,
  })

  useMapEvent('dragend', rerender)

  return (
    <div className={styles.container}>
      <Inputs
        coordinates={coordinates!}
        projectMapPresentationCrs={crs?.code}
      />
      <ToggleMapCenter />
      {crs && <ChooseCrs crs={crs} />}
    </div>
  )
}
