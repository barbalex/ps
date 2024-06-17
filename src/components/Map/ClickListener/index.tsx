import { memo, useMemo, useCallback } from 'react'
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

  console.log('Map ClickListener', {
    project_id,
    where,
    vectorLayers,
    vectorLayerTypes: vectorLayers.map((vl) => vl.type),
  })

  const onClick = useCallback(
    async (event) => {
      const { lat, lng } = event.latlng
      const zoom = map.getZoom()
      console.log('Map ClickListener, onClick', { lat, lng, zoom })

      const layersData = []

      // Three types of querying:
      // 1. Vector Layers from own tables (type !== 'wfs')
      // 2. Vector Layers from WFS with pre-downloaded data
      // 3. Vector Layers from WFS with no pre-downloaded data
      // TODO: filter own layers and layers with pre-downloaded data
      // by querying db.vector_layer_geoms using ST_CONTAINS once postgis arrives in pglite
      const vectorLayers = await db.vector_layers.findMany({
        where: { project_id, active: true, type: 'wfs', ...where },
        orderBy: [{ sort: 'asc' }, { label: 'asc' }],
      })
      console.log('Map ClickListener, onClick', { vectorLayers })
    },
    [db.vector_layers, map, project_id, where],
  )

  const map = useMapEvent('click', onClick)

  return null
})
