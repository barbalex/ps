import * as XLSX from '@e965/xlsx'
import { uuidv7 } from '@kripod/uuidv7'

import { addOperationAtom, store, pgliteDbAtom } from '../../store.ts'

const account_id = '018cf958-27e2-7000-90d3-59f024d467be' // TODO: replace with auth data when implemented

const VALUE_COLUMN: Record<string, string> = {
  integer: 'value_integer',
  numeric: 'value_numeric',
  text: 'value_text',
  date: 'value_date',
  datetime: 'value_datetime',
}

const parseWorkbook = (file: File, buffer: ArrayBuffer): XLSX.WorkBook => {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'tsv') {
    const text = new TextDecoder().decode(new Uint8Array(buffer))
    return XLSX.read(text, { type: 'string', FS: '\t', cellDates: true })
  }
  if (ext === 'csv') {
    const text = new TextDecoder().decode(new Uint8Array(buffer))
    return XLSX.read(text, { type: 'string', cellDates: true })
  }
  return XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: true })
}

const coerce = (raw: unknown, valueType: string): string | number | null => {
  if (raw === null || raw === undefined || raw === '') return null

  if (valueType === 'integer') {
    const n = Math.round(Number(raw))
    return isNaN(n) ? null : n
  }
  if (valueType === 'numeric') {
    const n = Number(raw)
    return isNaN(n) ? null : n
  }
  if (valueType === 'date' || valueType === 'datetime') {
    if (raw instanceof Date) return raw.toISOString()
    return String(raw)
  }
  return String(raw)
}

export const importListValues = async ({
  file,
  listId,
  valueType,
}: {
  file: File
  listId: string
  valueType: string | undefined
}) => {
  if (!valueType) return
  const col = VALUE_COLUMN[valueType]
  if (!col) return

  const buffer = await file.arrayBuffer()
  const workbook = parseWorkbook(file, buffer)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  // header: 1 gives raw array-of-arrays; no column header row expected
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    blankrows: false,
  })

  const db = store.get(pgliteDbAtom)

  // Fetch existing values for this list to avoid inserting duplicates
  const existing = await db.query<Record<string, unknown>>(
    `SELECT ${col} FROM list_values WHERE list_id = $1`,
    [listId],
  )
  const existingKeys = new Set(existing.rows.map((r) => String(r[col])))

  // Deduplicate within the imported batch as well
  const seen = new Set<string>()

  for (const row of rows) {
    const value = coerce(row[0], valueType)
    if (value === null) continue

    const key = String(value)
    if (existingKeys.has(key) || seen.has(key)) continue
    seen.add(key)

    const list_value_id = uuidv7()
    const draft = {
      list_value_id,
      account_id,
      list_id: listId,
      [col]: value,
      obsolete: false,
    }

    await db.query(
      `INSERT INTO list_values (list_value_id, account_id, list_id, ${col}, obsolete)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (list_value_id) DO NOTHING`,
      [list_value_id, account_id, listId, value, false],
    )

    store.set(addOperationAtom, {
      table: 'list_values',
      operation: 'insert',
      draft,
    })
  }
}
