import { useCallback, useMemo, memo } from 'react'
import { useLiveQuery } from 'electric-sql/react'
import { useCorbado } from '@corbado/react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import { useElectric } from '../ElectricProvider.tsx'
import {
  createVectorLayer,
  createVectorLayerDisplay,
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
      appState?.filter_vector_layers?.filter(
        (f) => Object.keys(f).length > 0,
      ) ?? [],
    [appState?.filter_vector_layers],
  )
  const where = filter.length > 1 ? { OR: filter } : filter[0]

  const { results: vectorLayers = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: { project_id, ...where },
      orderBy: { label: 'asc' },
    }),
  )
  const { results: vectorLayersUnfiltered = [] } = useLiveQuery(
    db.vector_layers.liveMany({
      where: { project_id },
      orderBy: { label: 'asc' },
    }),
  )
  const isFiltered = vectorLayers.length !== vectorLayersUnfiltered.length

  const add = useCallback(async () => {
    const vectorLayer = createVectorLayer({ project_id })
    await db.vector_layers.create({ data: vectorLayer })
    // also add vector_layer_display
    const vectorLayerDisplay = createVectorLayerDisplay({
      vector_layer_id: vectorLayer.vector_layer_id,
    })
    await db.vector_layer_displays.create({ data: vectorLayerDisplay })
    // also add layer_presentation
    const layerPresentation = createLayerPresentation({
      vector_layer_id: vectorLayer.vector_layer_id,
    })
    await db.layer_presentations.create({ data: layerPresentation })
    navigate({
      pathname: vectorLayer.vector_layer_id,
      search: searchParams.toString(),
    })
  }, [
    db.layer_presentations,
    db.vector_layer_displays,
    db.vector_layers,
    navigate,
    project_id,
    searchParams,
  ])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`Vector Layers (${
          isFiltered
            ? `${vectorLayers.length}/${vectorLayersUnfiltered.length}`
            : vectorLayers.length
        })`}
        addRow={add}
        tableName="vector layer"
        menus={
          <FilterButton
            table="vector_layers"
            filterField="filter_vector_layers"
          />
        }
      />
      <div className="list-container">
        {vectorLayers.map(({ vector_layer_id, label }) => (
          <Row
            key={vector_layer_id}
            to={vector_layer_id}
            label={label ?? vector_layer_id}
          />
        ))}
      </div>
    </div>
  )
})
