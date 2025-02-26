import { memo, useEffect, useMemo } from 'react'
import { useAtom } from 'jotai'
import { useLiveQuery } from '@electric-sql/pglite-react'

import { mapLayerSortingAtom } from '../../../store.ts'
import { Layer } from './Layer.tsx'

// TODO: text
// TODO: vite TypeError: Cannot read properties of undefined (reading 'ReactCurrentDispatcher')
export const Layers = memo(() => {
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)
  console.log('Layers, mapLayerSorting:', mapLayerSorting)

  // for every layer_presentation_id in mapLayerSorting, get the layer_presentation
  const resLP = useLiveQuery(
    `SELECT 
      *, 
      wms_layers_count as (SELECT COUNT(*) FROM wms_layers where wms_layers.layer_presentation_id = layer_presentations.layer_presentation_id) 
      FROM layer_presentations 
      WHERE 
        active = true
        ${
          mapLayerSorting.length &&
          ` AND layer_presentation_id IN (${mapLayerSorting
            .map((_, i) => `$${i + 1}`)
            .join(', ')})`
        }
        `,
    mapLayerSorting,
  )
  console.log('Layers, resLP:', resLP)
  const layerPresentations = useMemo(() => resLP?.rows ?? [], [resLP])
  console.log('Layers, layerPresentations:', layerPresentations)

  // useEffect(() => {
  //   const wmsLayersCount = layerPresentations.filter(
  //     (lp) => lp.wms_layers_count > 0,
  //   ).length
  //   // if no wms layer is present, add osm
  //   if (!wmsLayersCount && !mapLayerSorting.includes('osm')) {
  //     setMapLayerSorting([...mapLayerSorting, 'osm'])
  //   }
  // }, [mapLayerSorting, layerPresentations, setMapLayerSorting])

  return null

  if (!mapLayerSorting.length) return null

  // return mapLayerSorting.map((layerPresentationId, index) => (
  //   <Layer
  //     key={layerPresentationId}
  //     layerPresentationId={layerPresentationId}
  //     index={index}
  //   />
  // ))
})
