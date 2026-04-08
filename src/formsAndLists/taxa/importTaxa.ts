import * as XLSX from '@e965/xlsx'
import { uuidv7 } from '@kripod/uuidv7'

import { addOperationAtom, store, pgliteDbAtom, intlAtom } from '../../store.ts'
import { backgroundTasks } from '../../modules/backgroundTasks.ts'

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
const TAXA_IMPORT_BATCH_SIZE = 500

export const importTaxa = async ({
  file,
  taxonomyId,
}: {
  file: File
  taxonomyId: string
}) => {
  const intl = store.get(intlAtom)
  const taskId = `import-taxa-${taxonomyId}-${Date.now()}`

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
  const drafts: {
    taxon_id: string
    account_id: string
    taxonomy_id: string
    name: string
    id_in_source?: string
    url?: string
  }[] = []

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
      row['url'] !== null && row['url'] !== undefined && row['url'] !== ''
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

    drafts.push(draft)
  }

  if (drafts.length === 0) return

  backgroundTasks.add(
    taskId,
    intl?.formatMessage({
      id: 'bgTkImpTaxa',
      defaultMessage: 'Importiere Taxa',
    }) ?? 'Importiere Taxa',
    drafts.length,
  )

  try {
    let processed = 0

    for (let i = 0; i < drafts.length; i += TAXA_IMPORT_BATCH_SIZE) {
      const batch = drafts.slice(i, i + TAXA_IMPORT_BATCH_SIZE)
      const placeholders = batch
        .map(
          (_, rowIndex) =>
            `($${rowIndex * 6 + 1}, $${rowIndex * 6 + 2}, $${rowIndex * 6 + 3}, $${rowIndex * 6 + 4}, $${rowIndex * 6 + 5}, $${rowIndex * 6 + 6})`,
        )
        .join(', ')
      const args = batch.flatMap((draft) => [
        draft.taxon_id,
        draft.account_id,
        draft.taxonomy_id,
        draft.name,
        draft.id_in_source ?? null,
        draft.url ?? null,
      ])

      await db.query(
        `INSERT INTO taxa (taxon_id, account_id, taxonomy_id, name, id_in_source, url)
         VALUES ${placeholders}
         ON CONFLICT (taxon_id) DO NOTHING`,
        args,
      )

      store.set(addOperationAtom, {
        table: 'taxa',
        operation: 'upsertMany',
        draft: batch,
      })

      processed += batch.length
      backgroundTasks.updateProgress(taskId, processed)

      if (processed % TAXA_IMPORT_BATCH_SIZE === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }

    backgroundTasks.complete(taskId)
  } catch (error) {
    backgroundTasks.error(taskId, error?.message ?? 'Import failed')
    throw error
  }
}
