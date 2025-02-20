import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import {
  createWmsLayer,
  createLayerPresentation,
} from '../modules/createRows.ts'
import { ListViewHeader } from '../components/ListViewHeader/index.tsx'
import { Row } from '../components/shared/Row.tsx'
import { FilterButton } from '../components/shared/FilterButton.tsx'
import { wmsLayersFilterAtom } from '../store.ts'
import '../form.css'

export const Component = memo(() => {
  const [filter] = useAtom(wmsLayersFilterAtom)
  const isFiltered = !!filter
  const { project_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const db = usePGlite()

  const resultFiltered = useLiveQuery(
    `SELECT * FROM wms_layers WHERE project_id = $1${
      filter?.length ? ` AND (${filter})` : ''
    } order by label ASC`,
    [project_id],
  )
  const wmsLayers = resultFiltered?.rows ?? []

  const add = useCallback(async () => {
    const res = await createWmsLayer({ project_id, db })
    const wmsLayer = res.rows[0]
    // also add layer_presentation
    await createLayerPresentation({
      wms_layer_id: wmsLayer.wms_layer_id,
      db,
    })
    navigate({
      pathname: wmsLayer.wms_layer_id,
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
        addRow={add}
        menus={<FilterButton isFiltered={isFiltered} />}
      />
      <div className="list-container">
        {wmsLayers.map(({ wms_layer_id, label }) => (
          <Row
            key={wms_layer_id}
            to={wms_layer_id}
            label={label ?? wms_layer_id}
          />
        ))}
      </div>
    </div>
  )
})
