import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { useAtom } from 'jotai'
import { usePGlite, useLiveIncrementalQuery } from '@electric-sql/pglite-react'

import {
  createWmsLayer,
  createLayerPresentation,
} from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { Loading } from '../components/shared/Loading.tsx'
import { wmsLayersFilterAtom } from '../store.ts'
import { filterStringFromFilter } from '../modules/filterStringFromFilter.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(wmsLayersFilterAtom)
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const filterString = filterStringFromFilter(filter)
  const isFiltered = !!filterString
  const res = useLiveIncrementalQuery(
    `SELECT 
      wms_layer_id, 
      label 
    FROM wms_layers 
    WHERE project_id = $1
    ${isFiltered ? ` AND ${filterString} ` : ''} 
    ORDER BY label`,
    [project_id],
    'wms_layer_id',
  )
  const isLoading = res === undefined
  const wmsLayers = res?.rows ?? []

  const add = useCallback(async () => {
    const res = await createWmsLayer({ project_id, db })
    const data = res?.rows?.[0]
    if (!data) return
    // also add layer_presentation
    await createLayerPresentation({
      wms_layer_id: data.wms_layer_id,
      db,
    })
    navigate({
      pathname: data.wms_layer_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        namePlural="WMS Layers"
        nameSingular="wms layer"
        tableName="wms_layers"
        isFiltered={isFiltered}
        countFiltered={wmsLayers.length}
        isLoading={isLoading}
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {wmsLayers.map(({ wms_layer_id, label }) => (
              <Row
                key={wms_layer_id}
                to={wms_layer_id}
                label={label ?? wms_layer_id}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
})
