import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { VectorLayerChooser } from './VectorLayerChooser'
import { Vector_layers as VectorLayer } from '../../../generated/client'
import { useElectric } from '../../../ElectricProvider'

export const VectorLayers = () => {
  const { project_id } = useParams()

  const { db } = useElectric()!

  const where = project_id
    ? // Beware: projectId can be undefined and dexie does not like that
      {
        deleted: false,
        active: true,
        project_id,
        // Ensure needed data exists
        url: { not: null },
        wfs_layer: { not: null },
        output_format: { not: null },
      }
    : {
        deleted: false,
        active: true,
        // Ensure needed data exists
        url: { not: null },
        wfs_layer: { not: null },
        output_format: { not: null },
      }

  const { results = [] } = useLiveQuery(db.vector_layers.liveMany({ where }))

  const vectorLayers: VectorLayer[] = results

  // if (!vectorLayers.length) return []

  return vectorLayers.map((layer: VectorLayer) => {
    const partsToRedrawOn = {
      id: layer.vector_layer_id,
      url: layer.url,
      max_zoom: layer.max_zoom,
      min_zoom: layer.min_zoom,
      opacity: layer.opacity,
      wfs_layer: layer.wfs_layer,
      wfs_version: layer.wfs_version,
      output_format: layer.output_format,
    }

    return (
      <VectorLayerChooser key={JSON.stringify(partsToRedrawOn)} layer={layer} />
    )
  })
}
