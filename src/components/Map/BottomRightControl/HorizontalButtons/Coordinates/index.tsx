import { useState, memo, useCallback, useMemo } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'
import { usePGlite } from "@electric-sql/pglite-react"

import { ToggleMapCenter } from './ToggleMapCenter.tsx'
import { ChooseCrs } from './ChooseCrs.tsx'
import { epsgFrom4326 } from '../../../../../modules/epsgFrom4326.ts'
import { round } from '../../../../../modules/roundCoordinates.ts'
import { Inputs } from './Inputs.tsx'

const containerStyle = {
  display: 'flex',
  flex: '1 1 auto',
  columnGap: 5,
  flexWrap: 'nowrap',
  justifyContent: 'center',
  alignItems: 'center',
  border: '1px solid black',
  padding: '2px 4px',
  background: 'rgba(255, 255, 255, 0.7)',
}

export const CoordinatesControl = memo(() => {
  const map = useMap()
  const bounds = map.getBounds()
  const center = bounds.getCenter()
  const db = usePGlite()
  const { project_id = '99999999-9999-9999-9999-999999999999' } = useParams()

  const { results: project } = useLiveQuery(
    db.projects.liveUnique({
      where: { project_id },
      select: { map_presentation_crs: true },
    }),
  )
  const projectMapPresentationCrs = project?.map_presentation_crs
  const { results: projectCrs = [] } = useLiveQuery(
    db.project_crs.liveMany({ where: { project_id } }),
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [renderCount, setRenderCount] = useState(0)
  const rerender = useCallback(() => setRenderCount((prev) => prev + 1), [])

  const coordinates = useMemo(() => {
    if (!map) return null
    if (!center) return null
    const [x, y] = epsgFrom4326({
      x: center.lng,
      y: center.lat,
      projectMapPresentationCrs,
      crs: projectCrs.find((cr) => cr.code === projectMapPresentationCrs),
    })
    return { x: round(x), y: round(y) }
  }, [center, projectCrs, map, projectMapPresentationCrs])

  useMapEvent('dragend', rerender)

  return (
    <div style={containerStyle}>
      <Inputs
        coordinates={coordinates}
        projectMapPresentationCrs={projectMapPresentationCrs}
      />
      <ToggleMapCenter />
      <ChooseCrs />
    </div>
  )
})
