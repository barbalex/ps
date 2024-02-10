import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { VectorLayerChooser } from './VectorLayerChooser'
import {
  Vector_layers as VectorLayer,
  Vector_layer_displays as VectorLayerDisplay,
} from '../../../generated/client'
import { useElectric } from '../../../ElectricProvider'

export const VectorLayers = () => {
  const { project_id } = useParams()

  const { db } = useElectric()!

  const vectorLayerWhere = useMemo(() => {
    const where = {
      active: true,
      deleted: false,
      // Ensure needed data exists
      wfs_url: { not: null },
      wfs_layer: { not: null },
      wfs_output_format: { not: null },
    }
    if (project_id) {
      where.project_id = project_id
    }
    return where
  }, [project_id])

  const { results: vectorLayerResults = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: vectorLayerWhere,
      // TODO: not working
      // include: { vector_layer_displays: true },
    }),
  )

  const { results: vectorLayerDisplayResults = [] } = useLiveQuery(
    db.vector_layer_displays.liveMany({
      where: {
        deleted: false,
        vector_layer_id: {
          in: vectorLayerResults.map((vl) => vl.vector_layer_id),
        },
      },
    }),
  )
  const vectorLayerDisplays: VectorLayerDisplay[] = vectorLayerDisplayResults

  const vectorLayers: VectorLayer[] = vectorLayerResults

  if (!vectorLayers.length || !vectorLayerDisplays.length) return []

  return vectorLayers.map((layer: VectorLayer) => {
    const display = vectorLayerDisplays.find(
      (d) => d.vector_layer_id === layer.vector_layer_id,
    )

    return (
      <VectorLayerChooser
        key={layer.vector_layer_id}
        layer={layer}
        display={display}
      />
    )
  })
}
