import { read, utils, set_cptable } from '@e965/xlsx'
import * as cptable from '@e965/xlsx/dist/cpexcel.full.mjs'
import { point, Point, featureCollection } from '@turf/helpers'
import proj4 from 'proj4'
import axios from 'redaxios'
import { createObservation } from '../../modules/createRows.ts'
import { addOperationAtom, store, intlAtom } from '../../store.ts'
import { setShortTermOnlineFromFetchError } from '../../modules/setShortTermOnlineFromFetchError.ts'
import { backgroundTasks } from '../../modules/backgroundTasks.ts'

set_cptable(cptable)

// Helper to calculate geometry from observation data
const calculateGeometry = (observationData, observationImport, proj4Setup) => {
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
    const position = proj4(observationImport.crs, 'EPSG:4326', coordinates)
    const myPoint: Point = point(position.reverse())
    return featureCollection([myPoint])
  } catch (error) {
    console.error('Error calculating geometry:', error)
    return null
  }
}

// Helper to calculate label from observation data
const calculateLabel = (observationData, labelCreation) => {
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
const setupProj4 = async (observationImport) => {
  if (!observationImport.crs || observationImport.crs === 'EPSG:4326') {
    return true // No transformation needed
  }

  const system = observationImport.crs?.split?.(':')?.[0]?.toLowerCase?.()
  const number = observationImport.crs?.split?.(':')?.[1]
  const proj4Url = `https://spatialreference.org/ref/${system}/${number}/proj4.txt`

  try {
    const resp = await axios.get(proj4Url)
    const defs = resp?.data
    if (defs) {
      proj4.defs([
        ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs'],
        [observationImport.crs, defs],
      ])
      return true
    }
  } catch (error) {
    setShortTermOnlineFromFetchError(error)
    console.error('Error loading proj4 definitions:', error)
  }
  return false
}

/**
 * Handles "replace" operation: deletes all existing observations and creates new ones
 */
export const replaceObservations = async ({ file, observationImport, db }) => {
  if (!file) return { success: false, message: 'No file selected' }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async () => {
      const intl = store.get(intlAtom)
      const taskId = `import-replace-${observationImport.observation_import_id}`
      let taskStarted = false
      try {
        const fileAsArrayBuffer = reader.result
        const workbook = read(fileAsArrayBuffer, {
            type: 'array',
            codepage: 65001,
            cellText: false,
            cellDates: true,
          }),
          sheetName = workbook.SheetNames[0],
          worksheet = workbook.Sheets[sheetName]
        const data = utils.sheet_to_json(worksheet).map((d) => {
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

        // Insert new observations
        const observations = data.map((dat) =>
          createObservation({
            observationImportId: observationImport.observation_import_id,
            data: dat,
          }),
        )

        backgroundTasks.add(
          taskId,
          intl?.formatMessage({ id: 'bgTkRpl', defaultMessage: 'Ersetze Beobachtungen' }) ?? 'Ersetze Beobachtungen',
          observations.length,
        )
        taskStarted = true

        // Insert into database with geometry and label
        let processed = 0
        for (const occ of observations) {
          const idInSource = observationImport.id_field
            ? occ.data[observationImport.id_field]
            : null
          const geometry = calculateGeometry(occ.data, observationImport, true)
          const label = calculateLabel(
            occ.data,
            observationImport.label_creation,
          )

          await db.query(
            `INSERT INTO observations (observation_import_id, account_id, observation_id, data, id_in_source, geometry, label) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              occ.observation_import_id,
              occ.account_id,
              occ.observation_id,
              JSON.stringify(occ.data),
              idInSource ? String(idInSource) : null,
              geometry,
              label,
            ],
          )
          processed++
          backgroundTasks.updateProgress(taskId, processed)
          if (processed % 50 === 0) {
            await new Promise((r) => setTimeout(r, 0))
          }
        }

        // Sync to server
        store.set(addOperationAtom, {
          table: 'observations',
          operation: 'deleteMany',
          where: {
            observation_import_id: observationImport.observation_import_id,
          },
        })
        store.set(addOperationAtom, {
          table: 'observations',
          operation: 'insertMany',
          draft: observations,
        })

        backgroundTasks.complete(taskId)
        resolve({
          success: true,
          message:
            intl?.formatMessage(
              { id: 'oBsRplM', defaultMessage: '{count} Beobachtungen ersetzt' },
              { count: observations.length },
            ) ?? `${observations.length} Beobachtungen ersetzt`,
        })
      } catch (error) {
        if (taskStarted) backgroundTasks.error(taskId, error.message)
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
}) => {
  if (!file) return { success: false, message: 'No file selected' }
  if (!observationImport.id_field) {
    return { success: false, message: 'ID field not set' }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async () => {
      const intl = store.get(intlAtom)
      const taskId = `import-update-${observationImport.observation_import_id}`
      let taskStarted = false
      try {
        const fileAsArrayBuffer = reader.result
        const workbook = read(fileAsArrayBuffer, {
            type: 'array',
            codepage: 65001,
            cellText: false,
            cellDates: true,
          }),
          sheetName = workbook.SheetNames[0],
          worksheet = workbook.Sheets[sheetName]
        const data = utils.sheet_to_json(worksheet).map((d) => {
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
        const existingObservations = existingResult?.rows || []

        // Build map of existing observations by id_in_source
        const existingMap = new Map()
        for (const occ of existingObservations) {
          const idInSource = occ.data[observationImport.id_field]
          if (idInSource) {
            existingMap.set(String(idInSource), occ)
          }
        }

        // Build map of new data by id_field
        const newDataMap = new Map()
        for (const row of data) {
          const idValue = row[observationImport.id_field]
          if (idValue) {
            newDataMap.set(String(idValue), row)
          }
        }

        let updatedCount = 0
        let addedCount = 0
        let removedCount = 0

        backgroundTasks.add(
          taskId,
          intl?.formatMessage({ id: 'bgTkUpd', defaultMessage: 'Aktualisiere Beobachtungen' }) ?? 'Aktualisiere Beobachtungen',
          newDataMap.size,
        )
        taskStarted = true

        // Update existing and add new
        let processed = 0
        for (const [idInSource, newData] of newDataMap.entries()) {
          const existing = existingMap.get(idInSource)

          if (existing) {
            // Update existing (preserves place_id, not_to_assign, comment)
            const geometry = calculateGeometry(newData, observationImport, true)
            const label = calculateLabel(
              newData,
              observationImport.label_creation,
            )

            await db.query(
              `UPDATE observations SET data = $1, geometry = $2, label = $3, updated_at = now() WHERE observation_id = $4`,
              [
                JSON.stringify(newData),
                geometry,
                label,
                existing.observation_id,
              ],
            )
            updatedCount++

            store.set(addOperationAtom, {
              table: 'observations',
              rowIdName: 'observation_id',
              rowId: existing.observation_id,
              operation: 'update',
              draft: {
                data: newData,
                geometry,
                label,
                // Preserve user-set fields
                place_id: existing.place_id,
                not_to_assign: existing.not_to_assign,
                comment: existing.comment,
              },
              prev: existing,
            })
          } else {
            // Add new
            const newOcc = createObservation({
              observationImportId: observationImport.observation_import_id,
              data: newData,
            })
            const geometry = calculateGeometry(newData, observationImport, true)
            const label = calculateLabel(
              newData,
              observationImport.label_creation,
            )

            await db.query(
              `INSERT INTO observations (observation_import_id, account_id, observation_id, data, id_in_source, geometry, label) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                newOcc.observation_import_id,
                newOcc.account_id,
                newOcc.observation_id,
                JSON.stringify(newOcc.data),
                idInSource,
                geometry,
                label,
              ],
            )
            addedCount++

            store.set(addOperationAtom, {
              table: 'observations',
              operation: 'insert',
              draft: { ...newOcc, geometry, label },
            })
          }

          processed++
          backgroundTasks.updateProgress(taskId, processed)
          if (processed % 50 === 0) {
            await new Promise((r) => setTimeout(r, 0))
          }
        }

        // Remove observations not in new data
        for (const [idInSource, existing] of existingMap.entries()) {
          if (!newDataMap.has(idInSource)) {
            await db.query(
              `DELETE FROM observations WHERE observation_id = $1`,
              [existing.observation_id],
            )
            removedCount++

            store.set(addOperationAtom, {
              table: 'observations',
              rowIdName: 'observation_id',
              rowId: existing.observation_id,
              operation: 'delete',
            })
          }
        }

        backgroundTasks.complete(taskId)
        resolve({
          success: true,
          message:
            intl?.formatMessage(
              { id: 'oBsUpdM', defaultMessage: 'Aktualisiert: {updated}, hinzugefügt: {added}, entfernt: {removed}' },
              { updated: updatedCount, added: addedCount, removed: removedCount },
            ) ?? `Aktualisiert: ${updatedCount}, hinzugefügt: ${addedCount}, entfernt: ${removedCount}`,
        })
      } catch (error) {
        if (taskStarted) backgroundTasks.error(taskId, error.message)
        reject(error)
      }
    }

    reader.onabort = () => reject(new Error('File reading was aborted'))
    reader.onerror = () => reject(new Error('File reading has failed'))
    reader.readAsArrayBuffer(file)
  })
}
