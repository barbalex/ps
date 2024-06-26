import { useState, useEffect, memo, useCallback, useRef, useMemo } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { ToggleMapCenter } from './ToggleMapCenter.tsx'
import { ChooseCrs } from './ChooseCrs.tsx'
import { epsgFrom4326 } from '../../../../../modules/epsgFrom4326.ts'
import { useElectric } from '../../../../../ElectricProvider.tsx'
import { round } from '../../../../../modules/roundCoordinates.ts'
import { Inputs } from './Inputs.tsx'

const containerStyle = {
  display: 'flex',
  columnGap: 5,
  flexWrap: 'nowrap',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  border: '1px solid black',
  padding: '2px 4px',
  background: 'rgba(255, 255, 255, 0.7)',
  // ensure text always fits in the box
  // whiteSpace: 'nowrap',
  // overflow: 'hidden',
  // textOverflow: 'ellipsis',
  // minWidth: 72,
}

export const CoordinatesControl = memo(() => {
  const map = useMap()
  const bounds = map.getBounds()
  const center = bounds.getCenter()
  const { db } = useElectric()!
  const { project_id = '99999999-9999-9999-9999-999999999999' } = useParams()

  const { results: project } = useLiveQuery(
    db.projects.liveUnique({
      where: { project_id },
      select: { map_presentation_crs: true },
    }),
  )
  const projectMapPresentationCrs = project?.map_presentation_crs
  const { results: crs = [] } = useLiveQuery(
    db.crs.liveMany({ where: { project_id } }),
  )

  const [renderCount, setRenderCount] = useState(0)
  const rerender = useCallback(() => setRenderCount((prev) => prev + 1), [])

  // prevent click propagation on to map
  // https://stackoverflow.com/a/57013052/712005
  const ref = useRef()
  useEffect(() => {
    L.DomEvent.disableClickPropagation(ref.current)
    L.DomEvent.disableScrollPropagation(ref.current)
  }, [])

  const coordinates = useMemo(() => {
    if (!map) return null
    if (!center) return null
    const [x, y] = epsgFrom4326({
      x: center.lng,
      y: center.lat,
      projectMapPresentationCrs,
      crs: crs.find((cr) => cr.code === projectMapPresentationCrs),
    })
    return { x: round(x), y: round(y) }
  }, [center, crs, map, projectMapPresentationCrs])

  useMapEvent('dragend', rerender)

  console.log('CoordinatesControl', {
    coordinates,
    center,
    projectMapPresentationCrs,
    crs,
  })

  return (
    <div style={containerStyle} ref={ref}>
      <Inputs
        coordinates={coordinates}
        projectMapPresentationCrs={projectMapPresentationCrs}
      />
      <ToggleMapCenter />
      <ChooseCrs />
    </div>
  )
})
