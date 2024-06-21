import { memo, useCallback } from 'react'
import { useMap } from 'react-leaflet'
import { Button } from '@fluentui/react-components'
import { BsGlobe2 } from 'react-icons/bs'
import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../../../../../ElectricProvider.tsx'

export const ChooseCrs = memo(() => {
  const { project_id = '99999999-9999-9999-9999-999999999999' } = useParams()
  const map = useMap()

  const { db } = useElectric()!
  const { results: crs } = useLiveQuery(
    db.crs.liveMany({ where: { project_id } }),
  )

  const onClick = useCallback(() => {
    // TODO:
    // 1. open dialog to choose CRS
    // 2. when choosen, set projects.map_presentation_crs
  }, [])

  if (!project_id) return null
  // no crs? no need to choose
  if (!crs.length) return null

  return (
    <Button
      onClick={onClick}
      icon={<BsGlobe2 />}
      aria-label="Choose CRS (Coordinate Reference System)"
      title="Choose CRS (Coordinate Reference System)"
      size="small"
    />
  )
})
