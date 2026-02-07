import { read, utils, set_cptable } from '@e965/xlsx'
import * as cptable from '@e965/xlsx/dist/cpexcel.full.mjs'
import { point, Point, featureCollection } from '@turf/helpers'
import proj4 from 'proj4'
import axios from 'redaxios'
import { createOccurrence } from '../../modules/createRows.ts'
import { addOperationAtom, store } from '../../store.ts'
import { setShortTermOnlineFromFetchError } from '../../modules/setShortTermOnlineFromFetchError.ts'

set_cptable(cptable)

// Helper to calculate geometry from occurrence data
const calculateGeometry = (occurrenceData, occurrenceImport, proj4Setup) => {
  if (
    !occurrenceImport.x_coordinate_field ||
    !occurrenceImport.y_coordinate_field
  ) {
    return null
  }

  const coordinates = [
    occurrenceData[occurrenceImport.x_coordinate_field],
    occurrenceData[occurrenceImport.y_coordinate_field],
  ]

  if (!coordinates[0] || !coordinates[1]) {
    return null
  }

  try {
    const position = proj4(occurrenceImport.crs, 'EPSG:4326', coordinates)
    const myPoint: Point = point(position.reverse())
    return featureCollection([myPoint])
  } catch (error) {
    console.error('Error calculating geometry:', error)
    return null
  }
}

// Helper to calculate label from occurrence data
const calculateLabel = (occurrenceData, labelCreation) => {
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
    return occurrenceData?.[element.value] || ''
  })
  return labelParts.join('')
}

// Setup proj4 for coordinate transformations
const setupProj4 = async (occurrenceImport) => {
  if (!occurrenceImport.crs || occurrenceImport.crs === 'EPSG:4326') {
    return true // No transformation needed
  }

  const system = occurrenceImport.crs?.split?.(':')?.[0]?.toLowerCase?.()
  const number = occurrenceImport.crs?.split?.(':')?.[1]
  const proj4Url = `https://spatialreference.org/ref/${system}/${number}/proj4.txt`

  try {
    const resp = await axios.get(proj4Url)
    const defs = resp?.data
    if (defs) {
      proj4.defs([
        ['EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs'],
        [occurrenceImport.crs, defs],
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
 * Handles "replace" operation: deletes all existing occurrences and creates new ones
 */
export const replaceOccurrences = async ({ file, occurrenceImport, db }) => {
  if (!file) return { success: false, message: 'No file selected' }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async () => {
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
        await setupProj4(occurrenceImport)

        // Delete all existing occurrences for this import
        await db.query(
          `DELETE FROM occurrences WHERE occurrence_import_id = $1`,
          [occurrenceImport.occurrence_import_id],
        )

        // Insert new occurrences
        const occurrences = data.map((dat) =>
          createOccurrence({
            occurrenceImportId: occurrenceImport.occurrence_import_id,
            data: dat,
          }),
        )

        // Insert into database with geometry and label
        for (const occ of occurrences) {
          const idInSource =
            occurrenceImport.id_field ?
              occ.data[occurrenceImport.id_field]
            : null
          const geometry = calculateGeometry(occ.data, occurrenceImport, true)
          const label = calculateLabel(
            occ.data,
            occurrenceImport.label_creation,
          )

          await db.query(
            `INSERT INTO occurrences (occurrence_import_id, account_id, occurrence_id, data, id_in_source, geometry, label) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              occ.occurrence_import_id,
              occ.account_id,
              occ.occurrence_id,
              JSON.stringify(occ.data),
              idInSource ? String(idInSource) : null,
              geometry,
              label,
            ],
          )
        }

        // Sync to server
        store.set(addOperationAtom, {
          table: 'occurrences',
          operation: 'deleteMany',
          where: {
            occurrence_import_id: occurrenceImport.occurrence_import_id,
          },
        })
        store.set(addOperationAtom, {
          table: 'occurrences',
          operation: 'insertMany',
          draft: occurrences,
        })

        resolve({
          success: true,
          message: `Successfully replaced ${occurrences.length} occurrence${occurrences.length !== 1 ? 's' : ''}`,
        })
      } catch (error) {
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
export const updateAndExtendOccurrences = async ({
  file,
  occurrenceImport,
  db,
}) => {
  if (!file) return { success: false, message: 'No file selected' }
  if (!occurrenceImport.id_field) {
    return { success: false, message: 'ID field not set' }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async () => {
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
        await setupProj4(occurrenceImport)

        // Get existing occurrences (including user-set fields to preserve)
        const existingResult = await db.query(
          `SELECT occurrence_id, data, place_id, not_to_assign, comment FROM occurrences WHERE occurrence_import_id = $1`,
          [occurrenceImport.occurrence_import_id],
        )
        const existingOccurrences = existingResult?.rows || []

        // Build map of existing occurrences by id_in_source
        const existingMap = new Map()
        for (const occ of existingOccurrences) {
          const idInSource = occ.data[occurrenceImport.id_field]
          if (idInSource) {
            existingMap.set(String(idInSource), occ)
          }
        }

        // Build map of new data by id_field
        const newDataMap = new Map()
        for (const row of data) {
          const idValue = row[occurrenceImport.id_field]
          if (idValue) {
            newDataMap.set(String(idValue), row)
          }
        }

        let updatedCount = 0
        let addedCount = 0
        let removedCount = 0

        // Update existing and add new
        for (const [idInSource, newData] of newDataMap.entries()) {
          const existing = existingMap.get(idInSource)

          if (existing) {
            // Update existing (preserves place_id, not_to_assign, comment)
            const geometry = calculateGeometry(newData, occurrenceImport, true)
            const label = calculateLabel(
              newData,
              occurrenceImport.label_creation,
            )

            await db.query(
              `UPDATE occurrences SET data = $1, geometry = $2, label = $3, updated_at = now() WHERE occurrence_id = $4`,
              [
                JSON.stringify(newData),
                geometry,
                label,
                existing.occurrence_id,
              ],
            )
            updatedCount++

            store.set(addOperationAtom, {
              table: 'occurrences',
              rowIdName: 'occurrence_id',
              rowId: existing.occurrence_id,
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
            const newOcc = createOccurrence({
              occurrenceImportId: occurrenceImport.occurrence_import_id,
              data: newData,
            })
            const geometry = calculateGeometry(newData, occurrenceImport, true)
            const label = calculateLabel(
              newData,
              occurrenceImport.label_creation,
            )

            await db.query(
              `INSERT INTO occurrences (occurrence_import_id, account_id, occurrence_id, data, id_in_source, geometry, label) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                newOcc.occurrence_import_id,
                newOcc.account_id,
                newOcc.occurrence_id,
                JSON.stringify(newOcc.data),
                idInSource,
                geometry,
                label,
              ],
            )
            addedCount++

            store.set(addOperationAtom, {
              table: 'occurrences',
              operation: 'insert',
              draft: { ...newOcc, geometry, label },
            })
          }
        }

        // Remove occurrences not in new data
        for (const [idInSource, existing] of existingMap.entries()) {
          if (!newDataMap.has(idInSource)) {
            await db.query(`DELETE FROM occurrences WHERE occurrence_id = $1`, [
              existing.occurrence_id,
            ])
            removedCount++

            store.set(addOperationAtom, {
              table: 'occurrences',
              rowIdName: 'occurrence_id',
              rowId: existing.occurrence_id,
              operation: 'delete',
            })
          }
        }

        resolve({
          success: true,
          message: `Updated ${updatedCount}, added ${addedCount}, removed ${removedCount} occurrence${updatedCount + addedCount + removedCount !== 1 ? 's' : ''}`,
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onabort = () => reject(new Error('File reading was aborted'))
    reader.onerror = () => reject(new Error('File reading has failed'))
    reader.readAsArrayBuffer(file)
  })
}
