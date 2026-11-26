export type RecordTable = 'places' | 'subprojects'
export type Column = {
  name: string
  type: string
  custom?: boolean
  choices?: string[] | null
}
export const columnKey = (c: Column) => `${c.custom ? 'data.' : ''}${c.name}`
export type ImportedRow = Record<
  string,
  string | number | boolean | Record<string, string | number | boolean>
>

export const columnsFor = (table: RecordTable): Column[] =>
  table === 'places' ?
    [
      { name: 'name', type: 'text' },
      { name: 'since', type: 'integer' },
      { name: 'until', type: 'integer' },
      { name: 'relevant_for_reports', type: 'boolean' },
    ]
  : [
      { name: 'name', type: 'text' },
      { name: 'start_year', type: 'integer' },
      { name: 'end_year', type: 'integer' },
    ]

const reserved =
  /^(?:.*_id|id|level|data|geometry|bbox|gps_accuracy_m|label|sys_period|created_at|updated_at|updated_by|__proto__|constructor|prototype)$/i
export const allowExtra = (name: string) => !!name && !reserved.test(name)
export const maxRecords = 10000

const parse = (input: string, type: string) => {
  if (type === 'text') return input
  if (type === 'integer' && /^[+-]?\d+$/.test(input)) {
    const n = Number(input)
    if (n >= -2147483648 && n <= 2147483647) return n
  }
  if (
    type === 'decimal' &&
    /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(input) &&
    Number.isFinite(Number(input))
  )
    return Number(input)
  if (type === 'boolean' && /^(true|false)$/i.test(input))
    return input.toLowerCase() === 'true'
  if (type === 'time' && /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(input))
    return input
  if (type === 'date' || type === 'date-time') {
    const date = input.slice(0, 10)
    const midnight = new Date(`${date}T00:00:00Z`)
    if (
      Number.isFinite(+midnight) &&
      midnight.toISOString().slice(0, 10) === date
    ) {
      if (type === 'date' && input === date) return input
      if (
        type === 'date-time' &&
        /^\d{4}-\d\d-\d\dT(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d+)?)?(?:Z|[+-]\d\d:\d\d)$/.test(
          input,
        ) &&
        Number.isFinite(Date.parse(input))
      )
        return input
    }
  }
  throw new Error(`${JSON.stringify(input)}: ${type}`)
}

// Destinations: qualified column name, 'extra' (under its
// original header), 'skip', or '' (unknown header still needs a decision).
export function prepareRecords(
  sheet: string[][],
  columns: Column[],
  mapping: string[],
) {
  const rows: ImportedRow[] = []
  const errors: string[] = []
  const headers = sheet[0] ?? []
  const used = new Set<string>()
  const targets = headers.map((header, i) => {
    const choice = mapping[i]
    if (choice === 'skip') return
    const col =
      choice === 'extra' && allowExtra(header) ?
        { name: header, type: 'text', custom: true }
      : columns.find((c) => columnKey(c) === choice)
    if (
      !col ||
      (choice === 'extra' && columns.some((c) => c.name === header))
    ) {
      errors.push(`${header || `#${i + 1}`} → ?`)
      return
    }
    const key = `${col.custom ? 'data.' : ''}${col.name}`
    if (used.has(key)) errors.push(`${header} → ${key} (×2)`)
    used.add(key)
    return col
  })
  if (errors.length) return { rows, errors }
  for (const [index, cells] of sheet.slice(1).entries()) {
    if (!cells.some((cell) => cell.trim())) continue
    const row: ImportedRow = {}
    const data: Record<string, string | number | boolean> = Object.create(null)
    for (const [i, target] of targets.entries()) {
      const input = cells[i]?.trim()
      if (!input || !target) continue
      try {
        const value = parse(
          target.type === 'text' ? cells[i] : input,
          target.type,
        )
        if (target.choices && !target.choices.includes(String(value)))
          throw new Error(
            `${input} ∉ [${target.choices.slice(0, 10).join(', ')}]`,
          )
        if (target.custom) data[target.name] = value
        else row[target.name] = value
      } catch (error) {
        errors.push(
          `#${index + 2} · ${headers[i]}: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    }
    if (Object.keys(data).length) row.data = data
    if (Object.keys(row).length) rows.push(row)
    else if (!errors.length) errors.push(`#${index + 2}: ∅`)
  }
  return { rows, errors }
}

export async function readRecordSheet(file: File) {
  const x = await import('@e965/xlsx')
  const text = /\.(csv|tsv)$/i.test(file.name)
  const workbook = x.read(text ? await file.text() : await file.arrayBuffer(), {
    type: text ? 'string' : 'array',
    raw: true,
    sheets: 0,
    sheetRows: maxRecords + 2,
    ...(file.name.toLowerCase().endsWith('.tsv') && { FS: '\t' }),
    dateNF: 'yyyy-mm-dd',
  })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet?.['!ref']) throw new Error('Empty worksheet')
  const range = x.utils.decode_range(sheet['!fullref'] || sheet['!ref'])
  if (range.e.r > maxRecords || range.e.c >= 256)
    throw new Error('Maximum: 10000 rows × 256 columns')
  const rows = x.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    raw: false,
    defval: '',
    range: 0,
    blankrows: true,
  })
  const headers = Array.from(
    { length: range.e.c + 1 },
    (_, i) => rows[0]?.[i]?.trim() ?? '',
  )
  if (headers.some((h) => !h) || new Set(headers).size !== headers.length)
    throw new Error('Column headers must be non-empty and unique')
  if (!rows.slice(1).some((row) => row.some((cell) => cell.trim())))
    throw new Error('No data rows')
  return [headers, ...rows.slice(1)]
}
