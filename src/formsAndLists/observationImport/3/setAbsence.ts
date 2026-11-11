import {
  addOperationAtom,
  store,
  pgliteDbAtom,
  intlAtom,
} from '../../../store.ts'
import { backgroundTasks } from '../../../modules/backgroundTasks.ts'

import type ObservationImports from '../../../models/public/ObservationImports.ts'
import type Observations from '../../../models/public/Observations.ts'

/** the boolean SQL fragment deriving absence from a row, per the import's
 *  stored rule — NULL when the import does not derive absences */
export const absenceExpressionSql = (
  observationImport: Pick<
    ObservationImports,
    'absence_method' | 'absence_field' | 'absence_expression'
  >,
): string | null => {
  if (
    observationImport.absence_method === 'boolean_column' &&
    observationImport.absence_field
  ) {
    return `(data->>'${observationImport.absence_field.replaceAll("'", "''")}')::boolean IS TRUE`
  }
  if (
    observationImport.absence_method === 'sql_expression' &&
    observationImport.absence_expression
  ) {
    return `(${observationImport.absence_expression})`
  }
  return null
}

/**
 * Re-applies the stored absence rule to all observations of the import.
 * Used by the wizard's set button and after re-imports (replace and
 * update-and-extend) — so observations added later get their absence
 * derived by the same rule, without re-entering it.
 */
export const applyAbsenceRule = async ({
  observationImport,
  setNotification,
}: {
  observationImport: ObservationImports
  setNotification?: (message: string) => void
}) => {
  const sql = absenceExpressionSql(observationImport)
  if (!sql) return

  const db = store.get(pgliteDbAtom)!
  const intl = store.get(intlAtom)
  const taskId = `set-absence-${observationImport.observation_import_id}`
  const observationImportId = observationImport.observation_import_id

  // the rows before the update: prev of the queued operations
  const prevRes = await db.query(
    `SELECT * FROM observations WHERE observation_import_id = $1`,
    [observationImportId],
  )
  const prevRows = (prevRes?.rows ?? []) as unknown as Observations[]

  try {
    await db.query(
      `UPDATE observations SET absence = ${sql} WHERE observation_import_id = $1`,
      [observationImportId],
    )
  } catch (error) {
    setNotification?.((error as Error).message)
    throw error
  }

  const newRes = await db.query<{ observation_id: string; absence: boolean }>(
    `SELECT observation_id, absence FROM observations WHERE observation_import_id = $1`,
    [observationImportId],
  )
  const newValueById = new Map(
    (newRes?.rows ?? []).map((r) => [r.observation_id, r.absence]),
  )

  // queue an update operation per changed row so the result syncs
  const changed = prevRows.filter(
    (row) => (newValueById.get(row.observation_id) ?? false) !== row.absence,
  )
  backgroundTasks.add(
    taskId,
    intl?.formatMessage({
      id: 'absBgTsk',
      defaultMessage: 'Setze Absenzen',
    }) ?? 'Setze Absenzen',
    changed.length,
  )
  let processed = 0
  for (const row of changed) {
    store.set(addOperationAtom, {
      table: 'observations',
      rowIdName: 'observation_id',
      rowId: row.observation_id,
      operation: 'update',
      draft: { absence: newValueById.get(row.observation_id) ?? false },
      prev: { ...row },
    })
    processed++
    backgroundTasks.updateProgress(taskId, processed)
  }
  backgroundTasks.complete(taskId)
}
