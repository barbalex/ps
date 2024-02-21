import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useParams, useNavigate } from 'react-router-dom'

import { useElectric } from '../ElectricProvider'
import { createTileLayer } from '../modules/createRows'
import { ListViewHeader } from '../components/ListViewHeader'
import { Row } from '../components/shared/Row'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()

  const { db } = useElectric()!
  const { results: tileLayers = [] } = useLiveQuery(
    db.tile_layers.liveMany({
      where: { project_id, deleted: false },
      orderBy: [{ sort: 'asc' }, { label: 'asc' }],
    }),
  )

  const add = useCallback(async () => {
    const tileLayer = createTileLayer({ project_id })
    await db.tile_layers.create({ data: tileLayer })
    navigate(`/projects/${project_id}/tile-layers/${tileLayer.tile_layer_id}`)
  }, [db.tile_layers, navigate, project_id])

  return (
    <div className="list-view">
      <ListViewHeader title="Tile Layers" addRow={add} tableName="tile layer" />
      <div className="list-container">
        {tileLayers.map(({ tile_layer_id, label }) => (
          <Row
            key={tile_layer_id}
            to={`/projects/${project_id}/tile-layers/${tile_layer_id}`}
            label={label}
          />
        ))}
      </div>
    </div>
  )
}
