import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import {
  createVectorLayer,
  createVectorLayerDisplay,
  createLayerPresentation,
} from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { vectorLayersFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(vectorLayersFilterAtom)
  const isFiltered = !!filter

  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const result = useLiveQuery(
    `SELECT * FROM vector_layers WHERE project_id = $1${
      isFiltered ? ` AND(${filter})` : ''
    } order by label ASC`,
    [project_id],
  )
  const vectorLayers = result?.rows ?? []

  const add = useCallback(async () => {
    const res = createVectorLayer({ project_id, type: 'wfs', db })
    const vectorLayer = res.rows[0]
    // also add vector_layer_display
    await createVectorLayerDisplay({
      vector_layer_id: vectorLayer.vector_layer_id,
    })
    // also add layer_presentation
    await createLayerPresentation({
      vector_layer_id: vectorLayer.vector_layer_id,
      db,
    })
    navigate({
      pathname: vectorLayer.vector_layer_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="Vector Layers"
        nameSingular="Vector Layer"
        tableName="vector_layers"
        isFiltered={isFiltered}
        countFiltered={vectorLayers.length}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
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
