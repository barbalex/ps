import { restoreDiffFields } from './restoreDiffFields.ts'

interface DbLike {
  query(sql: string, params?: unknown[]): Promise<unknown>
}

type AddOperation = (params: {
  table: string
  rowIdName: string
  rowId: string | undefined
  operation: string
  draft: Record<string, unknown>
  prev: Record<string, unknown>
}) => void

type CreateRestoreDiffValuesHandlerArgs = {
  db: DbLike
  table: string
  rowIdName: string
  rowId: string | undefined
  row: Record<string, unknown> | undefined
  selectedHistory: Record<string, unknown> | undefined
  diffFields: string[]
  excludedRestoreFields: Set<string>
  addOperation: AddOperation
}

/**
 * Creates an async handler function that restores diff field values to the current row,
 * executes the SQL UPDATE, and records the operation for undo/sync tracking.
 */
export const createRestoreDiffValuesHandler = ({
  db,
  table,
  rowIdName,
  rowId,
  row,
  selectedHistory,
  diffFields,
  excludedRestoreFields,
  addOperation,
}: CreateRestoreDiffValuesHandlerArgs) => {
  return async () => {
    if (!row || !selectedHistory || !diffFields.length) return

    let restoreEntries: [string, unknown][]
    try {
      restoreEntries = await restoreDiffFields({
        db,
        table,
        rowIdField: rowIdName,
        rowId: rowId!,
        diffFields,
        selectedHistory,
        excludedRestoreFields,
      })
    } catch (error) {
      console.error(error)
      return
    }

    if (!restoreEntries.length) return

    addOperation({
      table,
      rowIdName,
      rowId,
      operation: 'update',
      draft: Object.fromEntries(restoreEntries),
      prev: { ...row },
    })
  }
}
