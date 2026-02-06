import { useLiveQuery } from '@electric-sql/pglite-react'
import { useParams } from '@tanstack/react-router'
import { useAtom } from 'jotai'

import { WmsLegend } from './WMS.tsx'
import { VectorLegend } from './Vector/index.tsx'
import { mapLayerSortingAtom } from '../../../../store.ts'
import { Container } from './Container.tsx'
import styles from './index.module.css'
import type WMSLayers from '../../../../models/public/WMSLayers.ts'
import type VectorLayers from '../../../../models/public/VectorLayers.ts'

export const Legends = () => {
  const [mapLayerSorting] = useAtom(mapLayerSortingAtom)
  const { projectId } = useParams({ strict: false })

  const resWmsLayers = useLiveQuery(
    `
    SELECT 
      wl.*,
      json_agg(
        json_build_object(
          'layer_presentation_id', lp.layer_presentation_id,
          'active', lp.active,
          'opacity_percent', lp.opacity_percent,
          'max_zoom', lp.max_zoom,
          'min_zoom', lp.min_zoom,
          'transparent', lp.transparent,
          'grayscale', lp.grayscale
        )
      ) FILTER (WHERE lp.layer_presentation_id IS NOT NULL) AS layer_presentations
    FROM wms_layers wl
    INNER JOIN layer_presentations lp ON wl.wms_layer_id = lp.wms_layer_id
    WHERE 
      lp.active = true
      ${projectId ? `AND wl.project_id = '${projectId}'` : ''}
    GROUP BY wl.wms_layer_id
  `,
  )
  const activeWmsLayers: WMSLayers[] = resWmsLayers?.rows ?? []

  // same for vector layers
  const resVectorLayers = useLiveQuery(
    `
    SELECT 
      vl.*,
      json_agg(
        json_build_object(
          'layer_presentation_id', lp.layer_presentation_id,
          'active', lp.active,
          'opacity_percent', lp.opacity_percent,
          'max_zoom', lp.max_zoom,
          'min_zoom', lp.min_zoom,
          'transparent', lp.transparent,
          'grayscale', lp.grayscale
        )
      ) FILTER (WHERE lp.layer_presentation_id IS NOT NULL) AS layer_presentations
    FROM vector_layers vl
    INNER JOIN layer_presentations lp ON vl.vector_layer_id = lp.vector_layer_id
    WHERE 
      lp.active = true
      ${projectId ? `AND vl.project_id = '${projectId}'` : ''}
    GROUP BY vl.vector_layer_id
  `,
  )
  const activeVectorLayers: VectorLayers[] = resVectorLayers?.rows ?? []

  // sort by mapLayerSorting
  const activeLayers = [...activeWmsLayers, ...activeVectorLayers].sort(
    (a, b) => {
      const aIndex = mapLayerSorting.findIndex(
        (ls) => ls === a.layer_presentations?.[0]?.layer_presentation_id,
      )
      const bIndex = mapLayerSorting.findIndex(
        (ls) => ls === b.layer_presentations?.[0]?.layer_presentation_id,
      )
      return aIndex - bIndex
    },
  )

  return activeLayers.length ?
      activeLayers?.map((layer, index) => {
        // display depends on layer type: wms / vector
        const isVectorLayer = 'vector_layer_id' in layer

        return (
          <Container
            key={layer.wms_layer_id ?? layer.vector_layer_id}
            layer={layer}
            isLast={index === activeLayers.length - 1}
          >
            {isVectorLayer ?
              <VectorLegend layer={layer} />
            : <WmsLegend layer={layer} />}
          </Container>
        )
      })
    : <p className={styles.noLayers}>No active layers</p>
}
