import { memo, useEffect, useMemo } from 'react'
import { useAtom } from 'jotai'
import { useLiveQuery, usePGlite } from '@electric-sql/pglite-react'

import { mapLayerSortingAtom } from '../../../store.ts'
import { Layer } from './Layer.tsx'

// TODO: text
export const Layers = memo(() => {
  const [mapLayerSorting, setMapLayerSorting] = useAtom(mapLayerSortingAtom)
  const db = usePGlite()

  // for every layer_presentation_id in mapLayerSorting, get the layer_presentation
  // const where = `active = true
  //       ${
  //         mapLayerSorting.length > 0
  //           ? ` AND layer_presentation_id IN (${mapLayerSorting
  //               .map((_, i) => `$${i + 1}`)
  //               .join(', ')})`
  //           : ''
  //       }`
  const where = `active = true
        ${
          mapLayerSorting.length > 0
            ? ` AND layer_presentation_id = ANY($1)`
            : ''
        }`
  const resLP = useLiveQuery(
    `SELECT * FROM layer_presentations WHERE ${where}`,
    [mapLayerSorting],
  )
  const layerPresentations = useMemo(() => resLP?.rows ?? [], [resLP])

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
  }, [mapLayerSorting, layerPresentations, setMapLayerSorting, db])

  if (!mapLayerSorting.length) return null

  return mapLayerSorting.map((layerPresentationId, index) => (
    <Layer
      key={layerPresentationId}
      layerPresentationId={layerPresentationId}
      index={index}
    />
  ))
})
