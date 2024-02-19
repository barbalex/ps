import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { Vector_layers as VectorLayer } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { createVectorLayer } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

type VlResults = {
  results: VectorLayer[]
}

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results: vectorLayers = [] }: VlResults = useLiveQuery(
    db.vector_layers.liveMany({
      where: { project_id, deleted: false },
      orderBy: [{ sort: 'asc' }, { label: 'asc' }],
    }),
  )

  const add = useCallback(async () => {
    const vectorLayer = createVectorLayer({ project_id })
    await db.vector_layers.create({ data: vectorLayer })
    navigate(
      `/projects/${project_id}/vector-layers/${vectorLayer.vector_layer_id}`,
    )
  }, [db.vector_layers, navigate, project_id])

  return (
    <div className="list-view">
      <ListViewHeader
        title="Vector Layers"
        addRow={add}
        tableName="vector layer"
      />
      <div className="list-container">
        {vectorLayers.map(({ vector_layer_id, label }) => (
          <Row
            key={vector_layer_id}
            to={`/projects/${project_id}/vector-layers/${vector_layer_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
