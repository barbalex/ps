import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { Vector_layer_displays as VectorLayerDisplay } from '../../../generated/client'
import { useElectric } from '../ElectricProvider'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

import '../form.css'

export const Component = () => {
  const { project_id, vector_layer_id } = useParams()

  const { db } = useElectric()
  const { results } = useLiveQuery(
    db.vector_layer_displays.liveMany({
      where: { vector_layer_id, deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  const vectorLayerDisplays: VectorLayerDisplay[] = results ?? []

  console.log(
    'hello vectorLayerDisplays, vectorLayerDisplays:',
    vectorLayerDisplays,
  )

  return (
    <div className="list-view">
      <ListViewHeader
        title="Vector Layer Displays"
        tableName="vector layer display"
      />
      <div className="list-container">
        {vectorLayerDisplays.map(({ vector_layer_display_id, label }) => (
          <Row
            key={vector_layer_display_id}
            to={`/projects/${project_id}/vector-layers/${vector_layer_id}/vector-layer-displays/${vector_layer_display_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
