import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useLiveQuery } from 'electric-sql/react'

import { VectorLayerChooser } from './VectorLayerChooser.tsx'
import { useElectric } from '../../../ElectricProvider.tsx'

export const VectorLayers = () => {
  const { project_id } = useParams()

  const { db } = useElectric()!

  const vectorLayerWhere = useMemo(() => {
    const where = {
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

  const { results: allVectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: vectorLayerWhere,
      include: { layer_presentations: true, vector_layer_displays: true },
    }),
  )
  const activeVectorLayers = allVectorLayers.filter((l) =>
    l.layer_presentations.some((lp) => lp.active),
  )

  const { results: vectorLayerDisplays = [] } = useLiveQuery(
    db.vector_layer_displays.liveMany({
      where: {
        vector_layer_id: {
          in: activeVectorLayers.map((vl) => vl.vector_layer_id),
        },
      },
    }),
  )

  if (!activeVectorLayers.length || !vectorLayerDisplays.length) return []

  return activeVectorLayers.map((layer) => (
    <VectorLayerChooser key={layer.vector_layer_id} layer={layer} />
  ))
}
