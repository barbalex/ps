import type { PGlite } from '@electric-sql/pglite'

// Two fields can be edited before the live query delivers the first write.
// Build both the update and its sync draft from the current database row.
export function updateCustomField(
  db: Pick<PGlite, 'transaction'>,
  {
    table,
    idField,
    id,
    jsonFieldName,
    name,
    value,
  }: {
    table: string
    idField: string
    id: string
    jsonFieldName: string
    name: string
    value: unknown
  },
) {
  return db.transaction(async (tx) => {
    const {
      rows: [prev],
    } = await tx.query<Record<string, unknown>>(
      `SELECT * FROM ${table} WHERE ${idField}=$1`,
      [id],
    )
    if (!prev) throw new Error(`Missing ${table} row ${id}`)
    const data = prev[jsonFieldName] ?? {}
    if (typeof data !== 'object' || Array.isArray(data))
      throw new Error(`Expected an object in ${table}.${jsonFieldName}`)
    const next = {
      ...data,
      [name]: value instanceof Date ? value.toISOString() : value,
    }
    if (value === undefined) delete next[name]
    await tx.query(
      `UPDATE ${table} SET ${jsonFieldName}=$1 WHERE ${idField}=$2`,
      [next, id],
    )
    return {
      table,
      rowIdName: idField,
      rowId: id,
      operation: 'update' as const,
      draft: { [jsonFieldName]: next },
      prev,
    }
  })
}
