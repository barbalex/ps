import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { usePGlite } from '@electric-sql/pglite-react'

import {
  createWmsLayer,
  createLayerPresentation,
} from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { project_id, wms_layer_id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createWmsLayer({ project_id, db })
    const wmsLayer = res.rows[0]
    // also add layer_presentation
    await createLayerPresentation({
      wms_layer_id: wmsLayer.wms_layer_id,
      db,
    })
    navigate({
      pathname: `../${wmsLayer.wms_layer_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, project_id, searchParams])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM wms_layers WHERE wms_layer_id = $1`, [
      wms_layer_id,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, wms_layer_id, navigate, searchParams])

  const toNext = useCallback(async () => {
    const result = await db.query(
      `SELECT * FROM wms_layers WHERE project_id = $1 ORDER BY label ASC`,
      [project_id],
    )
    const wmsLayers = result.rows
    const len = wmsLayers.length
    const index = wmsLayers.findIndex((p) => p.wms_layer_id === wms_layer_id)
    const next = wmsLayers[(index + 1) % len]
    navigate({
      pathname: `../${next.wms_layer_id}`,
      search: searchParams.toString(),
    })
  }, [db, project_id, navigate, searchParams, wms_layer_id])

  const toPrevious = useCallback(async () => {
    const result = await db.query(
      `SELECT * FROM wms_layers WHERE project_id = $1 ORDER BY label ASC`,
      [project_id],
    )
    const wmsLayers = result.rows
    const len = wmsLayers.length
    const index = wmsLayers.findIndex((p) => p.wms_layer_id === wms_layer_id)
    const previous = wmsLayers[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.wms_layer_id}`,
      search: searchParams.toString(),
    })
  }, [db, project_id, navigate, searchParams, wms_layer_id])

  return (
    <FormHeader
      title="WMS Layer"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="wms layer"
    />
  )
})
