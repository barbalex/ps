import { useLiveQuery } from 'electric-sql/react'
import { useParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'

import '../form.css'

export const Component = () => {
  const { project_id, vector_layer_id } = useParams()

  const { db } = useElectric()!
  const { results: vlds = [] } = useLiveQuery(
    db.vector_layer_displays.liveMany({
      where: { vector_layer_id, deleted: false },
      orderBy: { label: 'asc' },
    }),
  )

  return (
    <div className="list-view">
      <ListViewHeader
        title="Vector Layer Displays"
        tableName="vector layer display"
      />
      <div className="list-container">
        {vlds.map(({ vector_layer_display_id, label }) => (
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
