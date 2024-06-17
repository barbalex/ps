import { memo, useMemo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams } from 'react-router-dom'
import { useMapEvent } from 'react-leaflet/hooks'

import { useElectric } from '../../../ElectricProvider.tsx'

export const ClickListener = memo(() => {
  const { project_id } = useParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const filter = useMemo(
    () =>
      appState?.filter_vector_layers?.filter(
        (f) => Object.keys(f).length > 0,
      ) ?? [],
    [appState?.filter_vector_layers],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]

  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: { project_id, active: true, ...where },
      orderBy: [{ sort: 'asc' }, { label: 'asc' }],
    }),
  )

  console.log('Map ClickListener', {
    project_id,
    where,
    vectorLayers,
    vectorLayerTypes: vectorLayers.map((vl) => vl.type),
  })

  // TODO: filter non-wfs layers by querying using ST_CONTAINS once postgis arrives in pglite

  return null
})
