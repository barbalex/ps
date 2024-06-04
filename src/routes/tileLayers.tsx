import { useCallback } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import { createTileLayer } from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import '../form.css'

export const Component = () => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )
  
  const { results: tileLayers = [] } = useLiveQuery(
    db.tile_layers.liveMany({
      where: { project_id },
      orderBy: [{ sort: 'asc' }, { label: 'asc' }],
    }),
  )

  const add = useCallback(async () => {
    const tileLayer = createTileLayer({ project_id })
    await db.tile_layers.create({ data: tileLayer })
    navigate({
      pathname: tileLayer.tile_layer_id,
      search: searchParams.toString(),
    })
  }, [db.tile_layers, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader title="Tile Layers" addRow={add} tableName="tile layer" />
      <div className="list-container">
        {tileLayers.map(({ tile_layer_id, label }) => (
          <Row
            key={tile_layer_id}
            to={tile_layer_id}
            label={label ?? tile_layer_id}
          />
        ))}
      </div>
    </div>
  )
}
