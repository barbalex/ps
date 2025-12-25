import { useState } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'
import { useParams } from '@tanstack/react-router'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { ToggleMapCenter } from './ToggleMapCenter.tsx'
import { ChooseCrs } from './ChooseCrs.tsx'
import { epsgFrom4326 } from '../../../../../modules/epsgFrom4326.ts'
import { round } from '../../../../../modules/roundCoordinates.ts'
import { Inputs } from './Inputs.tsx'
import styles from './index.module.css'

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

  const resProject = useLiveQuery(
    `SELECT project_id, map_presentation_crs FROM projects WHERE project_id = $1`,
    [projectId],
  )
  const project = resProject?.rows?.[0]
  const projectMapPresentationCrs = project?.map_presentation_crs

  const resProjectCrs = useLiveQuery(
    `SELECT project_crs_id,code FROM project_crs WHERE project_id = $1`,
    [projectId],
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
    <div className={styles.container}>
      <Inputs
        coordinates={coordinates}
        projectMapPresentationCrs={projectMapPresentationCrs}
      />
      <ToggleMapCenter />
      <ChooseCrs />
    </div>
  )
}
