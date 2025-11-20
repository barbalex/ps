import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { usePGlite } from '@electric-sql/pglite-react'

import { mapLayerSortingAtom } from '../../../store.ts'
import { Layer } from './Layer.tsx'

// TODO: text
export const Layers = () => {
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)
  const db = usePGlite()

  useEffect(() => {
    const run = async () => {
      const res = await db.query(
        `SELECT COUNT(wms_layer_id) FROM layer_presentations where layer_presentation_id = ANY($1)`,
        [mapLayerSorting],
      )
      const wmsLayersCount = res.rows[0].count
      // if no wms layer is present, add osm
      if (
        !wmsLayersCount &&
        !mapLayerSorting.includes('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
      ) {
        setMapLayerSorting([
          ...mapLayerSorting,
          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        ])
      }
    }
    run()
  }, [mapLayerSorting, setMapLayerSorting, db])

  if (!mapLayerSorting.length) return null

  return mapLayerSorting.map((layerPresentationId, index) => (
    <Layer
      key={layerPresentationId}
      layerPresentationId={layerPresentationId}
      index={index}
    />
  ))
}
