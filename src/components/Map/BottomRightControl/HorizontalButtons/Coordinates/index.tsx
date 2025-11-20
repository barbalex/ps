import { useState } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'
import { useParams } from '@tanstack/react-router'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'

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

const getCoordinates = ({
  map,
  center,
  projectMapPresentationCrs,
  projectCrs,
}) => {
  if (!map) return null
  if (!center) return null
  const [x, y] = epsgFrom4326({
    x: center.lng,
    y: center.lat,
    projectMapPresentationCrs,
    crs: projectCrs.find((cr) => cr.code === projectMapPresentationCrs),
  })
  return { x: round(x), y: round(y) }
}

export const CoordinatesControl = () => {
  const map = useMap()
  const bounds = map.getBounds()
  const center = bounds.getCenter()
  const { projectId = '99999999-9999-9999-9999-999999999999' } = useParams({
    strict: false,
  })

  const resProject = useLiveIncrementalQuery(
    `SELECT project_id, map_presentation_crs FROM projects WHERE project_id = $1`,
    [projectId],
    'project_id',
  )
  const project = resProject?.rows?.[0]
  const projectMapPresentationCrs = project?.map_presentation_crs

  const resProjectCrs = useLiveIncrementalQuery(
    `SELECT project_crs_id,code FROM project_crs WHERE project_id = $1`,
    [projectId],
    'project_crs_id',
  )
  const projectCrs = resProjectCrs?.rows ?? []

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [renderCount, setRenderCount] = useState(0)
  const rerender = () => setRenderCount((prev) => prev + 1)

  const coordinates = getCoordinates({
    map,
    center,
    projectMapPresentationCrs,
    projectCrs,
  })

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
}
