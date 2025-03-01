import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import {
  createVectorLayer,
  createVectorLayerDisplay,
  createLayerPresentation,
} from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { vectorLayersFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(vectorLayersFilterAtom)
  const isFiltered = !!filter

  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const res = useLiveIncrementalQuery(
    `
    SELECT 
      vector_layer_id, 
      label 
    FROM vector_layers 
    WHERE project_id = $1
      ${isFiltered ? ` AND(${filter})` : ''} 
    ORDER BY label ASC`,
    [project_id],
    'vector_layer_id',
  )
  const isLoading = res === undefined
  const vectorLayers = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createVectorLayer({ project_id, type: 'wfs', db })
    const data = res?.rows?.[0]
    if (!data) return
    // also add vector_layer_display
    await createVectorLayerDisplay({
      vector_layer_id: data.vector_layer_id,
      db,
    })
    // also add layer_presentation
    await createLayerPresentation({
      vector_layer_id: data.vector_layer_id,
      db,
    })
    navigate({
      pathname: data.vector_layer_id,
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
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {vectorLayers.map(({ vector_layer_id, label }) => (
              <Row
                key={vector_layer_id}
                to={vector_layer_id}
                label={label ?? vector_layer_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
