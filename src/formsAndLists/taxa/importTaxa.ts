import * as XLSX from '@e965/xlsx'
import { uuidv7 } from '@kripod/uuidv7'

import { addOperationAtom, store, pgliteDbAtom } from '../../store.ts'

const account_id = '018cf958-27e2-7000-90d3-59f024d467be' // TODO: replace with auth data when implemented

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

type TaxonRow = Record<string, unknown>

export const importTaxa = async ({
  file,
  taxonomyId,
}: {
  file: File
  taxonomyId: string
}) => {
  const buffer = await file.arrayBuffer()
  const workbook = parseWorkbook(file, buffer)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  // Object mode: uses the first row as property names
  const rows: TaxonRow[] = XLSX.utils.sheet_to_json(sheet, {
    defval: null,
    blankrows: false,
  })

  const db = store.get(pgliteDbAtom)

  // Fetch existing names for this taxonomy to avoid duplicates
  const existing = await db.query<{ name: string }>(
    `SELECT name FROM taxa WHERE taxonomy_id = $1 AND name IS NOT NULL`,
    [taxonomyId],
  )
  const existingNames = new Set(existing.rows.map((r) => String(r.name)))

  // Deduplicate within the imported batch
  const seen = new Set<string>()

  for (const row of rows) {
    const name =
      row['name'] !== null && row['name'] !== undefined && row['name'] !== ''
        ? String(row['name']).trim()
        : null
    if (!name) continue

    if (existingNames.has(name) || seen.has(name)) continue
    seen.add(name)

    const id_in_source =
      row['id_in_source'] !== null &&
      row['id_in_source'] !== undefined &&
      row['id_in_source'] !== ''
        ? String(row['id_in_source']).trim()
        : null

    const url =
      row['url'] !== null &&
      row['url'] !== undefined &&
      row['url'] !== ''
        ? String(row['url']).trim()
        : null

    const taxon_id = uuidv7()
    const draft = {
      taxon_id,
      account_id,
      taxonomy_id: taxonomyId,
      name,
      ...(id_in_source !== null ? { id_in_source } : {}),
      ...(url !== null ? { url } : {}),
    }

    await db.query(
      `INSERT INTO taxa (taxon_id, account_id, taxonomy_id, name, id_in_source, url)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (taxon_id) DO NOTHING`,
      [taxon_id, account_id, taxonomyId, name, id_in_source, url],
    )

    store.set(addOperationAtom, {
      table: 'taxa',
      // Use upsert to make sync idempotent when the same row is retried.
      operation: 'upsert',
      draft,
    })
  }
}
