import { addOperationAtom, pgliteDbAtom, store } from '../store.ts'
import type LayerPresentations from '../models/public/LayerPresentations.ts'

/**
 * Sets layer_presentations.active: optimistic local update plus a queued
 * operation whose prev is the FULL row read from the db. UI rows often carry
 * only partial presentations ({layer_presentation_id, active}) — using those
 * as prev produced broken reverts (null updated_at) and failed permission
 * checks (no parent ids).
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
    operation: 'update',
    draft: { active },
    prev: prev ? { ...prev } : undefined,
  })
}
