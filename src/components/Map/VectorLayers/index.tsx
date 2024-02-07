import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { VectorLayerChooser } from './VectorLayerChooser'
import { Vector_layers as VectorLayer } from '../../../generated/client'
import { useElectric } from '../../../ElectricProvider'

export const VectorLayers = () => {
  const { project_id } = useParams()

  const { db } = useElectric()!

  const where = project_id
    ? // Beware: projectId can be undefined
      {
        deleted: false,
        // vector_layer_displays: { active: true },
        project_id,
        // Ensure needed data exists
        url: { not: null },
        wfs_layer: { not: null },
        output_format: { not: null },
      }
    : {
        deleted: false,
        // vector_layer_displays: { active: true },
        // Ensure needed data exists
        url: { not: null },
        wfs_layer: { not: null },
        output_format: { not: null },
      }

  const { results = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where,
      // include: { vector_layer_displays: true },
    }),
  )

  const vectorLayers: VectorLayer[] = results
  console.log('hello VectorLayers, vectorLayers:', vectorLayers)

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
