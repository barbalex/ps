// Layers created on a client used to end up with two displays without a
// value: the client's copy of the insert trigger made one — without an
// operation, so it never reached the server —, and the server's copy of the
// trigger the real one for the synced insert. (Not anymore: the client
// creates the display as a queued operation, see createVectorLayer.)
//
// This leaves such a layer with exactly one, here and on the server. The
// newest is kept (uuidv7 orders by creation time: that is the server's row,
// unless the clocks are off) and queued as an upsert — which changes nothing
// where it exists. The others are deleted. Whichever of the rows the server
// had, it ends up with the kept one.
import { addOperationAtom, pgliteDbAtom, store } from '../store.ts'

// returns how many layers were deduplicated
export const dedupeVectorLayerDisplays = async (): Promise<number> => {
  const db = store.get(pgliteDbAtom)
  if (!db) return 0

  const doublesRes = await db.query<{ display_ids: string[] }>(
    `SELECT array_agg(vector_layer_display_id ORDER BY vector_layer_display_id DESC) AS display_ids
    FROM vector_layer_displays
    WHERE display_property_value IS NULL
    GROUP BY vector_layer_id
    HAVING count(*) > 1`,
  )

  let deduped = 0
  for (const { display_ids } of doublesRes?.rows ?? []) {
    const [keptId, ...otherIds] = display_ids
    const keptRes = await db.query(
      `SELECT * FROM vector_layer_displays WHERE vector_layer_display_id = $1`,
      [keptId],
    )
    const kept = keptRes.rows[0] as Record<string, unknown>

    await db.query(
      `DELETE FROM vector_layer_displays WHERE vector_layer_display_id = ANY($1)`,
      [otherIds],
    )
    store.set(addOperationAtom, {
      table: 'vector_layer_displays',
      operation: 'delete',
      filter: {
        function: 'in',
        column: 'vector_layer_display_id',
        value: otherIds,
      },
    })
    store.set(addOperationAtom, {
      table: 'vector_layer_displays',
      rowIdName: 'vector_layer_display_id',
      rowId: keptId,
      operation: 'upsert',
      draft: kept,
    })
    deduped++
  }
  return deduped
}
