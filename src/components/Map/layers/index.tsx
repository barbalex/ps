import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { mapLayerSortingAtom } from '../../../store.ts'
import { useUrlLayers } from '../../../modules/useUrlLayers.ts'
import {
  defaultBackgroundLayerId,
  isBackgroundLayerId,
} from './backgroundLayers.ts'
import { Layer } from './Layer.tsx'

// TODO: text
export const Layers = () => {
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)
  const db = usePGlite()
  // the render list: the ?layers= url override wins, the sorting atom is
  // the fallback (see modules/useUrlLayers.ts)
  const { layers, isOverridden } = useUrlLayers()

  useEffect(() => {
    const run = async () => {
      // an active url override is the render list; leave the sorting
      // fallback alone while it runs
      if (isOverridden) return

      // if mapLayerSorting is empty, add the default background layer
      if (!mapLayerSorting.length) {
        setMapLayerSorting([defaultBackgroundLayerId])
        return
      }

      const res = await db.query(
        `SELECT COUNT(wms_layer_id) FROM layer_presentations where layer_presentation_id = ANY($1)`,
        [mapLayerSorting],
      )
      const wmsLayersCount = (res.rows[0] as { count: number }).count
      // if no wms layer is present, add the default background
      if (
        !wmsLayersCount &&
        !mapLayerSorting.some((id) => isBackgroundLayerId(id))
      ) {
        setMapLayerSorting([...mapLayerSorting, defaultBackgroundLayerId])
      }
    }
    run()
  }, [mapLayerSorting, setMapLayerSorting, db, isOverridden])

  if (!layers.length) return null

  return layers.map((layerPresentationId, index) => (
    <Layer
      key={layerPresentationId}
      layerPresentationId={layerPresentationId}
      index={index}
    />
  ))
}
