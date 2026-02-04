import { useParams, useNavigate } from '@tanstack/react-router'
import { usePGlite } from '@electric-sql/pglite-react'
import { useSetAtom } from 'jotai'
import { useRef, useEffect } from 'react'

import { createWmsLayer } from '../../modules/createRows.ts'
import { FormHeader } from '../../components/FormHeader/index.tsx'
import { addOperationAtom } from '../../store.ts'

const from = '/data/projects/$projectId_/wms-layers/$wmsLayerId'

export const Header = ({ autoFocusRef }) => {
  const { projectId, wmsLayerId } = useParams({ from })
  const navigate = useNavigate()
  const addOperation = useSetAtom(addOperationAtom)

  const db = usePGlite()

  // Keep a ref to the current wmsLayerId so it's always fresh in callbacks
  // without this users can only click toNext or toPrevious once
  const wmsLayerIdRef = useRef(wmsLayerId)
  useEffect(() => {
    wmsLayerIdRef.current = wmsLayerId
  }, [wmsLayerId])

  const addRow = async () => {
    const wmsLayerId = await createWmsLayer({ projectId })
    navigate({
      to: `../${wmsLayerId}`,
      params: (prev) => ({ ...prev, wmsLayerId }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = async () => {
    try {
      const prevRes = await db.query(
        `SELECT * FROM wms_layers WHERE wms_layer_id = $1`,
        [wmsLayerId],
      )
      const prev = prevRes?.rows?.[0] ?? {}
      await db.query(`DELETE FROM wms_layers WHERE wms_layer_id = $1`, [
        wmsLayerId,
      ])
      addOperation({
        table: 'wms_layers',
        rowIdName: 'wms_layer_id',
        rowId: wmsLayerId,
        operation: 'delete',
        prev,
      })
      navigate({ to: '..' })
    } catch (error) {
      console.error('Error deleting wms layer:', error)
    }
  }

  const toNext = async () => {
    try {
      const res = await db.query(
        `SELECT wms_layer_id FROM wms_layers WHERE project_id = $1 ORDER BY label`,
        [projectId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.wms_layer_id === wmsLayerIdRef.current)
      const next = rows[(index + 1) % len]
      navigate({
        to: `../${next.wms_layer_id}`,
        params: (prev) => ({ ...prev, wmsLayerId: next.wms_layer_id }),
      })
    } catch (error) {
      console.error('Error navigating to next wms layer:', error)
    }
  }

  const toPrevious = async () => {
    try {
      const res = await db.query(
        `SELECT wms_layer_id FROM wms_layers WHERE project_id = $1 ORDER BY label`,
        [projectId],
      )
      const rows = res?.rows
      const len = rows.length
      const index = rows.findIndex((p) => p.wms_layer_id === wmsLayerIdRef.current)
      const previous = rows[(index + len - 1) % len]
      navigate({
        to: `../${previous.wms_layer_id}`,
        params: (prev) => ({ ...prev, wmsLayerId: previous.wms_layer_id }),
      })
    } catch (error) {
      console.error('Error navigating to previous wms layer:', error)
    }
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
