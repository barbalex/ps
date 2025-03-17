import { useCallback, memo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import {
  createWmsLayer,
  createLayerPresentation,
} from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

export const Header = memo(({ autoFocusRef }) => {
  const { projectId, wmsLayerId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const db = usePGlite()

  const addRow = useCallback(async () => {
    const res = await createWmsLayer({ project_id: projectId, db })
    const wmsLayer = res?.rows?.[0]
    // also add layer_presentation
    await createLayerPresentation({
      wmsLayerId: wmsLayer.wms_layer_id,
      db,
    })
    navigate({
      pathname: `../${wmsLayer.wms_layer_id}`,
      search: searchParams.toString(),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, projectId, searchParams])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM wms_layers WHERE wms_layer_id = $1`, [
      wmsLayerId,
    ])
    navigate({ pathname: '..', search: searchParams.toString() })
  }, [db, wmsLayerId, navigate, searchParams])

  const toNext = useCallback(async () => {
    const res = await db.query(
      `SELECT wms_layer_id FROM wms_layers WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.wms_layer_id === wmsLayerId)
    const next = rows[(index + 1) % len]
    navigate({
      pathname: `../${next.wms_layer_id}`,
      search: searchParams.toString(),
    })
  }, [db, projectId, navigate, searchParams, wmsLayerId])

  const toPrevious = useCallback(async () => {
    const res = await db.query(
      `SELECT wms_layer_id FROM wms_layers WHERE project_id = $1 ORDER BY label`,
      [projectId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex((p) => p.wms_layer_id === wmsLayerId)
    const previous = rows[(index + len - 1) % len]
    navigate({
      pathname: `../${previous.wms_layer_id}`,
      search: searchParams.toString(),
    })
  }, [db, projectId, navigate, searchParams, wmsLayerId])

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
