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

  const { results: vectorLayerDisplayResults = [] } = useLiveQuery(
    db.vector_layer_displays.liveMany({
      where: { active: true },
    }),
  )
  const vectorLayerDisplays: VectorLayerDisplay[] = vectorLayerDisplayResults

  const vectorLayerWhere = useMemo(() => {
    const where = {
      vector_layer_id: {
        in: vectorLayerDisplays.map((d) => d.vector_layer_id),
      },
      deleted: false,
      // TODO: not working
      // vector_layer_displays: { active: true },
      // Ensure needed data exists
      url: { not: null },
      wfs_layer: { not: null },
      output_format: { not: null },
    }
    if (project_id) {
      where.project_id = project_id
    }
    return where
  }, [project_id, vectorLayerDisplays])

  const { results: vectorLayerResults = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: vectorLayerWhere,
      // TODO: not working
      // include: { vector_layer_displays: true },
    }),
  )

  const vectorLayers: VectorLayer[] = vectorLayerResults

  if (!vectorLayers.length || !vectorLayerDisplays.length) return []

  return vectorLayers.map((layer: VectorLayer) => {
    const display = vectorLayerDisplays.find(
      (d) => d.vector_layer_id === layer.vector_layer_id,
    )
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
      <VectorLayerChooser
        key={JSON.stringify(partsToRedrawOn)}
        layer={layer}
        display={display}
      />
    )
  })
}
