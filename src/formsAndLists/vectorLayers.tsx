import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
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
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'
import '../form.css'

const from = '/data/_authLayout/projects/$projectId_/vector-layers/'

export const VectorLayers = memo(() => {
  const [filter] = useAtom(vectorLayersFilterAtom)
  const { projectId } = useParams({ from })
  const navigate = useNavigate()
  const db = usePGlite()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const res = useLiveIncrementalQuery(
    `
    SELECT 
      vector_layer_id, 
      label 
    FROM vector_layers 
    WHERE 
      project_id = $1
      ${isFiltered ? ` AND ${filterString}` : ''} 
    ORDER BY label`,
    [projectId],
    'vector_layer_id',
  )
  const isLoading = res === undefined
  const vectorLayers = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createVectorLayer({
      projectId,
      type: 'wfs',
      db,
    })
    const data = res?.rows?.[0]
    if (!data) return
    // also add vector_layer_display
    await createVectorLayerDisplay({
      vectorLayerId: data.vector_layer_id,
      db,
    })
    // also add layer_presentation
    await createLayerPresentation({
      vectorLayerId: data.vector_layer_id,
      db,
    })
    navigate({
      to: data.vector_layer_id,
      params: (prev) => ({ ...prev, vectorLayerId: data.vector_layer_id }),
    })
  }, [db, navigate, projectId])

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
        {isLoading ?
          <Loading />
        : <>
            {vectorLayers.map(({ vector_layer_id, label }) => (
              <Row
                key={vector_layer_id}
                to={vector_layer_id}
                label={label ?? vector_layer_id}
              />
            ))}
          </>
        }
      </div>
    </div>
  )
})
