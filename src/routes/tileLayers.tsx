import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import {
  createTileLayer,
  createLayerPresentation,
} from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import '../form.css'

export const Component = memo(() => {
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user: authUser } = useCorbado()

  const { db } = useElectric()!
  const { results: appState } = useLiveQuery(
    db.app_states.liveFirst({ where: { user_email: authUser?.email } }),
  )

  const filter = useMemo(
    () =>
      appState?.filter_tile_layers?.filter((f) => Object.keys(f).length > 0) ??
      [],
    [appState?.filter_tile_layers],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]

  const { results: tileLayers = [] } = useLiveQuery(
    db.tile_layers.liveMany({
      where: { project_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: tileLayersUnfiltered = [] } = useLiveQuery(
    db.tile_layers.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = tileLayers.length !== tileLayersUnfiltered.length

  const add = useCallback(async () => {
    const tileLayer = createTileLayer({ project_id })
    await db.tile_layers.create({ data: tileLayer })
    // also add layer_presentation
    const layerPresentation = createLayerPresentation({
      tile_layer_id: tileLayer.tile_layer_id,
    })
    await db.layer_presentations.create({ data: layerPresentation })
    navigate({
      pathname: tileLayer.tile_layer_id,
      search: searchParams.toString(),
    })
  }, [
    db.layer_presentations,
    db.tile_layers,
    navigate,
    project_id,
    searchParams,
  ])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Tile Layers (${
          isFiltered
            ? `${tileLayers.length}/${tileLayersUnfiltered.length}`
            : tileLayers.length
        })`}
        addRow={add}
        tableName="tile layer"
        menus={
          <FilterButton table="tile_layers" filterField="filter_tile_layers" />
        }
      />
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
})
