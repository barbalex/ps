import proj4 from 'proj4'
import type { PGliteWithLive } from '@electric-sql/pglite/live'
import { createObservation } from '../../modules/createRows.ts'
import { httpGet } from '../../modules/httpGet.ts'
import {
  addOperationAtom,
  store,
  intlAtom,
  type QueuedOperation,
} from '../../store.ts'
import { setShortTermOnlineFromFetchError } from '../../modules/setShortTermOnlineFromFetchError.ts'
import { backgroundTasks } from '../../modules/backgroundTasks.ts'
import { loadXlsx } from '../../modules/loadXlsx.ts'
import { applyAbsenceRule } from './3/setAbsence.ts'
import type ObservationImports from '../../models/public/ObservationImports.ts'

type ProcessDataResult = { success: boolean; message: string }

type ExistingObservation = {
  observation_id: string
  data: Record<string, unknown>
  place_id: string | null
  not_to_assign: boolean | null
  comment: string | null
}

// rows per bulk statement: one parameterized statement via unnest instead of
// one round-trip per observation (imports of ~2000 observations used to run
// one INSERT/UPDATE per row, each invalidating the live queries)
const CHUNK_SIZE = 500

// Helper to calculate geometry from observation data
const calculateGeometry = (
  observationData: Record<string, unknown>,
  observationImport: ObservationImports,
  _proj4Setup: boolean,
) => {
  if (
    !observationImport.x_coordinate_field ||
    !observationImport.y_coordinate_field
  ) {
    return null
  }

  const coordinates = [
    observationData[observationImport.x_coordinate_field],
    observationData[observationImport.y_coordinate_field],
  ]

  if (!coordinates[0] || !coordinates[1]) {
    return null
  }

  try {
    const position = proj4(
      observationImport.crs as string,
      'EPSG:4326',
      coordinates as number[],
    )
    // GeometryCollection, like setGeometries writes it: ST_GeomFromGeoJSON
    // rejects FeatureCollections, and the column is typed
    // geometry(GeometryCollection, 4326)
    return {
      type: 'GeometryCollection',
      geometries: [{ type: 'Point', coordinates: position.reverse() }],
    }
  } catch (error) {
    console.error('Error calculating geometry:', error)
    return null
  }
}

// Helper to calculate label from observation data
const calculateLabel = (
  observationData: Record<string, unknown>,
  labelCreation: unknown,
) => {
  if (
    !labelCreation ||
    !Array.isArray(labelCreation) ||
    labelCreation.length === 0
  ) {
    return null
  }

  const labelParts = labelCreation.map((element) => {
    if (element.type === 'separator') {
      return element.value || ''
    }
    // type === 'field'
    return observationData?.[element.value] || ''
  })
  return labelParts.join('')
}

// Setup proj4 for coordinate transformations
const setupProj4 = async (observationImport: ObservationImports) => {
  if (!observationImport.crs || observationImport.crs === 'EPSG:4326') {
    return true // No transformation needed
  }

  const system = observationImport.crs?.split?.(':')?.[0]?.toLowerCase?.()
  const number = observationImport.crs?.split?.(':')?.[1]
  const proj4Url = `https://spatialreference.org/ref/${system}/${number}/proj4.txt`

  try {
    const resp = await httpGet<string>(proj4Url)
    const defs = resp.ok ? resp.data : undefined
    if (defs) {
      proj4.defs([
        ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs'],
        [observationImport.crs, defs],
      ])
      return true
    }
    if (!resp.ok) {
      console.error(
        `Error loading proj4 definitions, status ${resp.status} ${resp.statusText} for ${proj4Url}`,
      )
    }
  } catch (error) {
    setShortTermOnlineFromFetchError(error)
    console.error('Error loading proj4 definitions:', error)
  }
  return false
}

type PreparedRow = {
  observation: ReturnType<typeof createObservation>
  idInSource: string | null
  geometry: Record<string, unknown> | null
  label: string | null
}

// compute all rows in js first, then insert them in bulk chunks
const bulkInsertObservations = async (
  db: PGliteWithLive,
  rows: PreparedRow[],
  onProgress?: (processed: number) => void,
) => {
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, i + CHUNK_SIZE)
    await db.query(
      `INSERT INTO observations (observation_import_id, observation_id, data, id_in_source, geometry, label)
       SELECT i, o, d, s, ST_SetSRID(ST_GeomFromGeoJSON(g), 4326), l
       FROM unnest(
         $1::uuid[], $2::uuid[], $3::jsonb[], $4::text[], $5::jsonb[], $6::text[]
       ) AS t(i, o, d, s, g, l)`,
      [
        chunk.map((r) => r.observation.observation_import_id),
        chunk.map((r) => r.observation.observation_id),
        chunk.map((r) => JSON.stringify(r.observation.data)),
        chunk.map((r) => r.idInSource),
        chunk.map((r) => (r.geometry ? JSON.stringify(r.geometry) : null)),
        chunk.map((r) => r.label),
      ],
    )
    onProgress?.(i + chunk.length)
    // let the ui breathe between chunks
    await new Promise((r) => setTimeout(r, 0))
  }
}

const prepareRow = (
  observationImport: ObservationImports,
  data: Record<string, unknown>,
): PreparedRow => {
  const observation = createObservation({
    observationImportId: observationImport.observation_import_id,
    data,
  })
  const idValue =
    observationImport.id_field ? data?.[observationImport.id_field] : undefined
  return {
    observation,
    idInSource: idValue ? String(idValue) : null,
    geometry: calculateGeometry(data, observationImport, true),
    label: calculateLabel(data, observationImport.label_creation),
  }
}

/**
 * Handles "replace" operation: deletes all existing observations and creates new ones
 */
export const replaceObservations = async ({
  file,
  observationImport,
  db,
}: {
  file?: File | undefined
  observationImport: ObservationImports
  db: PGliteWithLive
}): Promise<ProcessDataResult> => {
  if (!file) return { success: false, message: 'No file selected' }

  return new Promise<ProcessDataResult>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async () => {
      const intl = store.get(intlAtom)
      const taskId = `import-replace-${observationImport.observation_import_id}`
      let taskStarted = false
      try {
        const fileAsArrayBuffer = reader.result
        const { read, utils } = await loadXlsx()
        const workbook = read(fileAsArrayBuffer, {
            type: 'array',
            codepage: 65001,
            cellText: false,
            cellDates: true,
          }),
          sheetName = workbook.SheetNames[0],
          worksheet = workbook.Sheets[sheetName]
        const data = utils
          .sheet_to_json<Record<string, unknown>>(worksheet)
          .map((d) => {
            const { __rowNum__, ...rest } = d
            return rest
          })

        // Setup proj4 if needed
        await setupProj4(observationImport)

        // Delete all existing observations for this import
        await db.query(
          `DELETE FROM observations WHERE observation_import_id = $1`,
          [observationImport.observation_import_id],
        )

        // compute rows (geometry, label, id_in_source) in js first
        const rows = data.map((dat) => prepareRow(observationImport, dat))

        backgroundTasks.add(
          taskId,
          intl?.formatMessage({
            id: 'bgTkRpl',
            defaultMessage: 'Ersetze Beobachtungen',
          }) ?? 'Ersetze Beobachtungen',
          rows.length,
        )
        taskStarted = true

        await bulkInsertObservations(db, rows, (processed) =>
          backgroundTasks.updateProgress(taskId, processed),
        )

        // Sync to server
        store.set(addOperationAtom, {
          table: 'observations',
          // a filtered delete — NOT 'deleteMany': the server's
          // apply_operations and the per-operation fallback only know
          // 'delete' with a {column, function, value} filter (the previous
          // 'deleteMany' op was always rejected as an unknown operation,
          // silently leaving the replaced rows on the server)
          operation: 'delete',
          filter: {
            column: 'observation_import_id',
            function: 'eq',
            value: observationImport.observation_import_id,
          },
        } as unknown as Omit<QueuedOperation, 'id' | 'time'>)
        store.set(addOperationAtom, {
          table: 'observations',
          operation: 'insertMany',
          // include geometry/label/id_in_source so the server gets the same
          // rows as the local database (the geometry/label computed above
          // used to be missing from the synced draft)
          draft: rows.map((r) => ({
            ...r.observation,
            id_in_source: r.idInSource,
            geometry: r.geometry,
            label: r.label,
          })),
        })

        // re-apply the stored absence rule to the new observations
        await applyAbsenceRule({ observationImport })

        backgroundTasks.complete(taskId)
        resolve({
          success: true,
          message:
            intl?.formatMessage(
              {
                id: 'oBsRplM',
                defaultMessage: '{count} Beobachtungen ersetzt',
              },
              { count: rows.length },
            ) ?? `${rows.length} Beobachtungen ersetzt`,
        })
      } catch (error) {
        if (taskStarted) backgroundTasks.error(taskId, (error as Error).message)
        reject(error)
      }
    }

    reader.onabort = () => reject(new Error('File reading was aborted'))
    reader.onerror = () => reject(new Error('File reading has failed'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Handles "update_and_extend" operation: updates existing, adds new, removes missing
 */
export const updateAndExtendObservations = async ({
  file,
  observationImport,
  db,
}: {
  file?: File | undefined
  observationImport: ObservationImports
  db: PGliteWithLive
}): Promise<ProcessDataResult> => {
  if (!file) return { success: false, message: 'No file selected' }
  if (!observationImport.id_field) {
    return { success: false, message: 'ID field not set' }
  }

  return new Promise<ProcessDataResult>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async () => {
      const intl = store.get(intlAtom)
      const taskId = `import-update-${observationImport.observation_import_id}`
      let taskStarted = false
      try {
        const fileAsArrayBuffer = reader.result
        const { read, utils } = await loadXlsx()
        const workbook = read(fileAsArrayBuffer, {
            type: 'array',
            codepage: 65001,
            cellText: false,
            cellDates: true,
          }),
          sheetName = workbook.SheetNames[0],
          worksheet = workbook.Sheets[sheetName]
        const data = utils
          .sheet_to_json<Record<string, unknown>>(worksheet)
          .map((d) => {
            const { __rowNum__, ...rest } = d
            return rest
          })

        // Setup proj4 if needed
        await setupProj4(observationImport)

        // Get existing observations (including user-set fields to preserve)
        const existingResult = await db.query(
          `SELECT observation_id, data, place_id, not_to_assign, comment FROM observations WHERE observation_import_id = $1`,
          [observationImport.observation_import_id],
        )
        const existingObservations = (existingResult?.rows ||
          []) as ExistingObservation[]

        // Build map of existing observations by id_in_source
        const existingMap = new Map<string, ExistingObservation>()
        for (const occ of existingObservations) {
          const idInSource = occ.data[observationImport.id_field!]
          if (idInSource) {
            existingMap.set(String(idInSource), occ)
          }
        }

        // Build map of new data by id_field
        const newDataMap = new Map<string, Record<string, unknown>>()
        for (const row of data) {
          const idValue = row[observationImport.id_field!]
          if (idValue) {
            newDataMap.set(String(idValue), row)
          }
        }

        backgroundTasks.add(
          taskId,
          intl?.formatMessage({
            id: 'bgTkUpd',
            defaultMessage: 'Aktualisiere Beobachtungen',
          }) ?? 'Aktualisiere Beobachtungen',
          newDataMap.size,
        )
        taskStarted = true

        let processed = 0
        const reportProgress = () => {
          processed++
          backgroundTasks.updateProgress(taskId, processed)
        }

        // compute the three work sets in js first
        const toUpdate: {
          existing: ExistingObservation
          row: PreparedRow
        }[] = []
        const toInsert: PreparedRow[] = []
        const toRemove: ExistingObservation[] = []

        for (const [idInSource, newData] of newDataMap.entries()) {
          const existing = existingMap.get(idInSource)
          if (existing) {
            toUpdate.push({
              existing,
              row: prepareRow(observationImport, newData),
            })
          } else {
            toInsert.push(prepareRow(observationImport, newData))
          }
        }
        for (const [idInSource, existing] of existingMap.entries()) {
          if (!newDataMap.has(idInSource)) toRemove.push(existing)
        }

        // bulk-update existing (preserves place_id, not_to_assign, comment)
        for (let i = 0; i < toUpdate.length; i += CHUNK_SIZE) {
          const chunk = toUpdate.slice(i, i + CHUNK_SIZE)
          await db.query(
            `UPDATE observations AS o
             SET data = v.data, geometry = ST_SetSRID(ST_GeomFromGeoJSON(v.geometry), 4326),
                 label = v.label, updated_at = now()
             FROM (SELECT * FROM unnest($1::uuid[], $2::jsonb[], $3::jsonb[], $4::text[]) AS v(id, data, geometry, label)) AS v
             WHERE o.observation_id = v.id`,
            [
              chunk.map((u) => u.existing.observation_id),
              chunk.map((u) => JSON.stringify(u.row.observation.data)),
              chunk.map((u) =>
                u.row.geometry ? JSON.stringify(u.row.geometry) : null,
              ),
              chunk.map((u) => u.row.label),
            ],
          )
          // one sync operation per row, like before (keeps prev for revert)
          for (const { existing, row } of chunk) {
            store.set(addOperationAtom, {
              table: 'observations',
              rowIdName: 'observation_id',
              rowId: existing.observation_id,
              operation: 'update',
              draft: {
                data: row.observation.data,
                geometry: row.geometry,
                label: row.label,
                // Preserve user-set fields
                place_id: existing.place_id,
                not_to_assign: existing.not_to_assign,
                comment: existing.comment,
              },
              prev: existing,
            })
            reportProgress()
          }
          await new Promise((r) => setTimeout(r, 0))
        }

        // bulk-insert new
        for (let i = 0; i < toInsert.length; i += CHUNK_SIZE) {
          const chunk = toInsert.slice(i, i + CHUNK_SIZE)
          await bulkInsertObservations(db, chunk)
          reportProgress()
        }
        if (toInsert.length) {
          store.set(addOperationAtom, {
            table: 'observations',
            operation: 'insertMany',
            draft: toInsert.map((r) => ({
              ...r.observation,
              id_in_source: r.idInSource,
              geometry: r.geometry,
              label: r.label,
            })),
          })
        }

        // bulk-remove observations not in new data
        if (toRemove.length) {
          await db.query(
            `DELETE FROM observations WHERE observation_id = ANY($1::uuid[])`,
            [toRemove.map((r) => r.observation_id)],
          )
          for (const existing of toRemove) {
            store.set(addOperationAtom, {
              table: 'observations',
              rowIdName: 'observation_id',
              rowId: existing.observation_id,
              operation: 'delete',
            })
          }
        }

        // re-apply the stored absence rule, so updated and added
        // observations derive their absence the same way
        await applyAbsenceRule({ observationImport })

        backgroundTasks.complete(taskId)
        const updatedCount = toUpdate.length
        const addedCount = toInsert.length
        const removedCount = toRemove.length
        resolve({
          success: true,
          message:
            intl?.formatMessage(
              {
                id: 'oBsUpdM',
                defaultMessage:
                  'Aktualisiert: {updated}, hinzugefügt: {added}, entfernt: {removed}',
              },
              {
                updated: updatedCount,
                added: addedCount,
                removed: removedCount,
              },
            ) ??
            `Aktualisiert: ${updatedCount}, hinzugefügt: ${addedCount}, entfernt: ${removedCount}`,
        })
      } catch (error) {
        if (taskStarted) backgroundTasks.error(taskId, (error as Error).message)
        reject(error)
      }
    }

    reader.onabort = () => reject(new Error('File reading was aborted'))
    reader.onerror = () => reject(new Error('File reading has failed'))
    reader.readAsArrayBuffer(file)
  })
}
