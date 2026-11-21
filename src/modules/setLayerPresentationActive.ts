import { addOperationAtom, pgliteDbAtom, store } from '../store.ts'
import type LayerPresentations from '../models/public/LayerPresentations.ts'

/**
 * Sets layer_presentations.active: optimistic local update plus a queued
 * UPSERT of the full row. An upsert (not an update) because presentations
 * exist that the server never had: the old insert triggers created them
 * locally without an operation, and table-layer creation used to skip the
 * queue — an update on those is discarded as "row deleted on the server".
 * The upsert recreates a missing row instead, healing those clients.
 * Upserts also bypass the update aggregation, so toggles flush at once.
 */
export const setLayerPresentationActive = async (
  layerPresentationId: string,
  active: boolean,
) => {
  const db = store.get(pgliteDbAtom)
  if (!db) return

  const res = await db.query<LayerPresentations>(
    `SELECT * FROM layer_presentations WHERE layer_presentation_id = $1`,
    [layerPresentationId],
  )
  const prev = res.rows[0]

  await db.query(
    `UPDATE layer_presentations SET active = $1 WHERE layer_presentation_id = $2`,
    [active, layerPresentationId],
  )

  store.set(addOperationAtom, {
    table: 'layer_presentations',
    rowIdName: 'layer_presentation_id',
    rowId: layerPresentationId,
    operation: 'upsert',
    draft: { ...prev, active },
  })
}
