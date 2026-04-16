import { removeOperation } from './removeOperation.ts'
import { store, pgliteDbAtom } from '../store.ts'

// Irregular table→PK mappings that don't follow the simple "strip s" rule.
const IRREGULAR_PK: Record<string, string> = {
  taxa: 'taxon_id',
}

// Infer the primary-key column name from the table name following codebase
// convention: strip trailing 's' (or 'ies'→'y'), append '_id'.
// Falls back to scanning the draft for the first *_id key that isn't in the
// provided FK columns set.
const inferPkColumn = (
  table: string,
  draft: Record<string, unknown> = {},
): string | undefined => {
  if (IRREGULAR_PK[table]) return IRREGULAR_PK[table]
  let candidate: string
  if (table.endsWith('ies')) {
    candidate = `${table.slice(0, -3)}y_id`
  } else {
    candidate = `${table.replace(/s$/, '')}_id`
  }
  if (candidate in draft) return candidate
  return undefined
}

// reverts an optimistic operation (change in PGlite) after writing to the server fails
export const revertOperation = async (o) => {
  if (!o) return

  const { table, rowIdName, rowId, operation, draft, prev } = o

  const pgliteDb = store.get(pgliteDbAtom)

  // syncing re-introduces the deleted row
  if (operation === 'delete') return

  if (operation === 'insert') {
    // rowIdName/rowId may not be set on insert operations from createRows.ts;
    // infer the PK column from the table name following the codebase convention.
    const pkColumn = rowIdName ?? inferPkColumn(table, draft)
    const pkValue = rowId ?? (pkColumn ? draft?.[pkColumn] : undefined)
    if (!pkColumn || pkValue == null) {
      return console.error(
        `revertOperation: cannot determine PK for insert revert on ${table}`,
      )
    }
    try {
      await pgliteDb.query(`DELETE FROM ${table} WHERE ${pkColumn} = $1`, [
        pkValue,
      ])
    } catch (error) {
      // TODO: surface
      return console.error(
        `revertOperation: error deleting row ${pkValue} from ${table}:`,
        error,
      )
    }
    return
  }

  try {
    let valuesSql = ``
    Object.keys(draft).forEach((key, index) => {
      valuesSql += `${key} = $${index + 1},`
    })
    const draftKeysLength = Object.keys(draft).length
    const isUsersTable = table === 'users'
    // base param index after SET columns (draft + updated_at + optional updated_by)
    const baseParamCount = draftKeysLength + 1 + (isUsersTable ? 0 : 1)

    let whereSql: string
    let whereArgs: unknown[]
    if (o.filters?.length) {
      whereSql = o.filters
        .map((f, i) => `${f.column} = $${baseParamCount + i + 1}`)
        .join(' AND ')
      whereArgs = o.filters.map((f) => f.value)
    } else {
      whereSql = `${rowIdName} = $${baseParamCount + 1}`
      whereArgs = [rowId]
    }

    const args = [
      ...Object.keys(draft).map((key) => prev[key]),
      prev.updated_at,
      ...(isUsersTable ? [] : [prev.updated_by]),
      ...whereArgs,
    ]
    await pgliteDb.query(
      `UPDATE ${table} 
      SET 
        ${valuesSql} 
        updated_at = $${draftKeysLength + 1}
        ${isUsersTable ? '' : `, updated_by = $${draftKeysLength + 2}`}
      WHERE ${whereSql}`,
      args,
    )
  } catch (error) {
    // TODO: surface
    return console.error(
      `revertOperation: error reverting row ${rowId} in ${table}:`,
      error,
    )
  }

  return removeOperation(operation)
}
