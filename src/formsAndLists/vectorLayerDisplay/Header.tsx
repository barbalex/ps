import { useParams, useNavigate } from '@tanstack/react-router'
import { useSetAtom } from 'jotai'
import { usePGlite, useLiveQuery } from '@electric-sql/pglite-react'

import { FormHeader } from '../../components/FormHeader/index.tsx'
import { createVectorLayerDisplay } from '../../modules/createRows.ts'
import {
  mapDrawerVectorLayerDisplayAtom,
  addOperationAtom,
} from '../../store.ts'

export const Header = ({
  vectorLayerDisplayId: vectorLayerDisplayIdFromProps,
  autoFocusRef,
  from,
}) => {
  const addOperation = useSetAtom(addOperationAtom)
  const setMapLayerDrawerVectorLayerDisplayId = useSetAtom(
    mapDrawerVectorLayerDisplayAtom,
  )
  const { vectorLayerDisplayId: vectorLayerDisplayIdFromRouter } = useParams({
    from,
  })
  const vectorLayerDisplayId =
    vectorLayerDisplayIdFromProps ?? vectorLayerDisplayIdFromRouter

  const db = usePGlite()
  // fetch the vector_layer_id from the db as params is not available in the map drawer
  const res = useLiveQuery(
    `SELECT vector_layer_display_id, vector_layer_id FROM vector_layer_displays WHERE vector_layer_display_id = $1`,
    [vectorLayerDisplayId],
  )
  const vectorLayerDisplays = res?.rows ?? []
  const vectorLayerId = vectorLayerDisplays?.[0]?.vector_layer_id

  const navigate = useNavigate()

  const addRow = async () => {
    const res = await createVectorLayerDisplay({ vectorLayerId, db })
    const row = res?.rows?.[0]
    if (vectorLayerDisplayIdFromProps) {
      setMapLayerDrawerVectorLayerDisplayId(row.vector_layer_display_id)
      return
    }
    navigate({
      to: `../${row.vector_layer_display_id}`,
      params: (prev) => ({
        ...prev,
        vectorLayerDisplayId: row.vector_layer_display_id,
      }),
    })
    autoFocusRef?.current?.focus()
  }

  const deleteRow = () => {
    db.query(
      `DELETE FROM vector_layer_displays WHERE vector_layer_display_id = $1`,
      [vectorLayerDisplayId],
    )
    if (vectorLayerDisplayIdFromProps) {
      setMapLayerDrawerVectorLayerDisplayId(null)
      return
    }
    navigate({ to: '..' })
  }

  const toNext = async () => {
    const res = await db.query(
      `SELECT vector_layer_display_id FROM vector_layer_displays WHERE vector_layer_id = $1 ORDER BY label`,
      [vectorLayerId],
    )
    const rows = res?.rows
    const len = rows.length
    const index = rows.findIndex(
      (p) => p.vector_layer_display_id === vectorLayerDisplayId,
    )
    const next = rows[(index + 1) % len]
    console.log('VectorLayerDisplay.Header.toNext', {
      next,
      rows,
      res,
      vectorLayerDisplayIdFromProps,
    })
    if (vectorLayerDisplayIdFromProps) {
      setMapLayerDrawerVectorLayerDisplayId(next.vector_layer_display_id)
      return
    }
    navigate({
      to: `../${next.vector_layer_display_id}`,
      params: (prev) => ({
        ...prev,
        vectorLayerDisplayId: next.vector_layer_display_id,
      }),
    })
  }

  const toPrevious = async () => {
    const res = await db.query(
      `SELECT vector_layer_display_id FROM vector_layer_displays WHERE vector_layer_id = $1 ORDER BY label`,
      [vectorLayerId],
    )
    const vectorLayerDisplays = res?.rows
    const len = vectorLayerDisplays.length
    const index = vectorLayerDisplays.findIndex(
      (p) => p.vector_layer_display_id === vectorLayerDisplayId,
    )
    const previous = vectorLayerDisplays[(index + len - 1) % len]
    if (vectorLayerDisplayIdFromProps) {
      setMapLayerDrawerVectorLayerDisplayId(previous.vector_layer_display_id)
      return
    }
    navigate({
      to: `../${previous.vector_layer_display_id}`,
      params: (prev) => ({
        ...prev,
        vectorLayerDisplayId: previous.vector_layer_display_id,
      }),
    })
  }

  return (
    <FormHeader
      title="Vector Layer Display"
      addRow={addRow}
      deleteRow={deleteRow}
      toNext={toNext}
      toPrevious={toPrevious}
      tableName="vector layer display"
    />
  )
}
