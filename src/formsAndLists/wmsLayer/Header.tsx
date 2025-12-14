import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'

import {
  createWmsLayer,
  createLayerPresentation,
} from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/projects/$projectId_/wms-layers/$wmsLayerId'

export const Header = ({ autoFocusRef }) => {
  const { projectId, wmsLayerId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  const addRow = async () => {
    const res = await createWmsLayer({ projectId, db })
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
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(`DELETE FROM wms_layers WHERE wms_layer_id = $1`, [wmsLayerId])
    navigate({ to: '..' })
  }

  const toNext = async () => {
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
  }

  const toPrevious = async () => {
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
  }

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
}
