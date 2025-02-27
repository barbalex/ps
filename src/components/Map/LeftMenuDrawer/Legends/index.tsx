import { memo, useMemo } from 'react'
import { useLiveIncrementalQuery } from '@electric-sql/pglite-react'
import { useParams } from 'react-router-dom'
import { useAtom } from 'jotai'

import { WmsLegend } from './WMS.tsx'
import { VectorLegend } from './Vector/index.tsx'
import { mapLayerSortingAtom } from '../../../../store.ts'
import { Container } from './Container.tsx'

const noLayersStyle = {
  margin: 0,
  paddingLeft: 10,
  paddingRight: 10,
  paddingBottom: 10,
}

export const Legends = memo(() => {
  const [mapLayerSorting] = useAtom(mapLayerSortingAtom)
  const { project_id } = useParams()

  const resWmsLayers = useLiveIncrementalQuery(
    `
    SELECT * 
    FROM wms_layers 
    WHERE 
      EXISTS (
        SELECT 1 
        FROM layer_presentations lp 
        WHERE 
          wms_layers.wms_layer_id = lp.wms_layer_id 
          AND lp.active = true
      )
      ${project_id ? `AND project_id = '${project_id}'` : ''}
  `,
    undefined,
    'wms_layer_id',
  )
  const activeWmsLayers = useMemo(
    () => resWmsLayers?.rows ?? [],
    [resWmsLayers],
  )

  // same for vector layers
  const resVectorLayers = useLiveIncrementalQuery(
    `
    SELECT *
    FROM vector_layers
    WHERE 
      EXISTS (
        SELECT 1 
        FROM layer_presentations lp 
        WHERE 
          vector_layers.vector_layer_id = lp.vector_layer_id 
          AND lp.active = true
      )
      ${project_id ? `AND project_id = '${project_id}'` : ''}
  `,
    undefined,
    'vector_layer_id',
  )
  const activeVectorLayers = useMemo(
    () => resVectorLayers?.rows ?? [],
    [resVectorLayers],
  )

  // sort by mapLayerSorting
  const activeLayers = useMemo(
    () =>
      [...activeWmsLayers, ...activeVectorLayers].sort((a, b) => {
        const aIndex = mapLayerSorting.findIndex(
          (ls) => ls === a.layer_presentations?.[0]?.layer_presentation_id,
        )
        const bIndex = mapLayerSorting.findIndex(
          (ls) => ls === b.layer_presentations?.[0]?.layer_presentation_id,
        )
        return aIndex - bIndex
      }),
    [activeVectorLayers, activeWmsLayers, mapLayerSorting],
  )

  return activeLayers.length ? (
    activeLayers?.map((layer, index) => {
      // display depends on layer type: wms / vector
      const isVectorLayer = 'vector_layer_id' in layer

      return (
        <Container
          key={layer.wms_layer_id ?? layer.vector_layer_id}
          layer={layer}
          isLast={index === activeLayers.length - 1}
        >
          {isVectorLayer ? (
            <VectorLegend layer={layer} />
          ) : (
            <WmsLegend layer={layer} />
          )}
        </Container>
      )
    })
  ) : (
    <p style={noLayersStyle}>No active layers</p>
  )
})
