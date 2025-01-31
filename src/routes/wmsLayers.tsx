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

  const resultUnfiltered = useLiveQuery(
    `SELECT * FROM wms_layers WHERE project_id = $1`,
    [project_id],
  )
  const wmsLayersUnfiltered = resultUnfiltered?.rows ?? []

  const isFiltered = wmsLayers.length !== wmsLayersUnfiltered.length

  const add = useCallback(async () => {
    const wmsLayer = createWmsLayer({ project_id })
    const columns = Object.keys(wmsLayer).join(',')
    const values = Object.values(wmsLayer)
    const sql = `insert into wms_layers (${columns}) values ($1)`
    await db.query(sql, values)

    // also add layer_presentation
    const layerPresentation = createLayerPresentation({
      wms_layer_id: wmsLayer.wms_layer_id,
    })
    const columnsLp = Object.keys(layerPresentation).join(',')
    const valuesLp = Object.values(layerPresentation)
    const sqlLp = `insert into layer_presentations (${columnsLp}) values ($1)`
    await db.query(sqlLp, valuesLp)
    navigate({
      pathname: wmsLayer.wms_layer_id,
      search: searchParams.toString(),
    })
  }, [db, navigate, project_id, searchParams])

  return (
    <div className="list-view">
      <ListViewHeader
        title={`WMS Layers (${
          isFiltered
            ? `${wmsLayers.length}/${wmsLayersUnfiltered.length}`
            : wmsLayers.length
        })`}
        addRow={add}
        tableName="wms layer"
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
