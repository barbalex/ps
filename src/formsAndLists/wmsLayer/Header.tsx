import { useCallback, memo } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'

import {
  createWmsLayer,
  createLayerPresentation,
} from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'

const from = '/data/_authLayout/projects/$projectId_/wms-layers/$wmsLayerId'

export const Header = memo(({ autoFocusRef }) => {
  const { projectId, wmsLayerId } = useParams({ from })
  const navigate = useNavigate()

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
      to: `../${wmsLayer.wms_layer_id}`,
      params: (prev) => ({ ...prev, wmsLayerId: wmsLayer.wms_layer_id }),
    })
    autoFocusRef.current?.focus()
  }, [autoFocusRef, db, navigate, projectId])

  const deleteRow = useCallback(async () => {
    await db.query(`DELETE FROM wms_layers WHERE wms_layer_id = $1`, [
      wmsLayerId,
    ])
    navigate({ to: '..' })
  }, [db, wmsLayerId, navigate])

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
      to: `../${next.wms_layer_id}`,
      params: (prev) => ({ ...prev, wmsLayerId: next.wms_layer_id }),
    })
  }, [db, projectId, navigate, wmsLayerId])

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
      to: `../${previous.wms_layer_id}`,
      params: (prev) => ({ ...prev, wmsLayerId: previous.wms_layer_id }),
    })
  }, [db, projectId, navigate, wmsLayerId])

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
