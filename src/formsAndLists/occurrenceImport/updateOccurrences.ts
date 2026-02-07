import { read, utils, set_cptable } from '@e965/xlsx'
import * as cptable from '@e965/xlsx/dist/cpexcel.full.mjs'
import { createOccurrence } from '../../modules/createRows.ts'
import { addOperationAtom, store } from '../../store.ts'

set_cptable(cptable)

/**
 * Handles "replace" operation: deletes all existing occurrences and creates new ones
 */
export const replaceOccurrences = async ({
  file,
  additionalData,
  db,
}) => {
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

        // Delete all existing occurrences for this import
        await db.query(
          `DELETE FROM occurrences WHERE occurrence_import_id = $1`,
          [additionalData.occurrence_import_id],
        )

        // Insert new occurrences
        const occurrences = data.map((dat) =>
          createOccurrence({
            occurrenceImportId: additionalData.occurrence_import_id,
            data: dat,
          }),
        )

        // Insert into database (simplified - no chunking for now)
        for (const occ of occurrences) {
          const idInSource = additionalData.id_field
            ? occ.data[additionalData.id_field]
            : null
          await db.query(
            `INSERT INTO occurrences (occurrence_import_id, account_id, occurrence_id, data, id_in_source) VALUES ($1, $2, $3, $4, $5)`,
            [
              occ.occurrence_import_id,
              occ.account_id,
              occ.occurrence_id,
              JSON.stringify(occ.data),
              idInSource ? String(idInSource) : null,
            ],
          )
        }

        // Sync to server
        store.set(addOperationAtom, {
          table: 'occurrences',
          operation: 'deleteMany',
          where: { occurrence_import_id: additionalData.occurrence_import_id },
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
  additionalData,
  db,
}) => {
  if (!file) return { success: false, message: 'No file selected' }
  if (!additionalData.id_field) {
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

        // Get existing occurrences (including user-set fields to preserve)
        const existingResult = await db.query(
          `SELECT occurrence_id, data, place_id, not_to_assign, comment FROM occurrences WHERE occurrence_import_id = $1`,
          [additionalData.occurrence_import_id],
        )
        const existingOccurrences = existingResult?.rows || []

        // Build map of existing occurrences by id_in_source
        const existingMap = new Map()
        for (const occ of existingOccurrences) {
          const idInSource = occ.data[additionalData.id_field]
          if (idInSource) {
            existingMap.set(String(idInSource), occ)
          }
        }

        // Build map of new data by id_field
        const newDataMap = new Map()
        for (const row of data) {
          const idValue = row[additionalData.id_field]
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
            await db.query(
              `UPDATE occurrences SET data = $1, updated_at = now() WHERE occurrence_id = $2`,
              [JSON.stringify(newData), existing.occurrence_id],
            )
            updatedCount++

            store.set(addOperationAtom, {
              table: 'occurrences',
              rowIdName: 'occurrence_id',
              rowId: existing.occurrence_id,
              operation: 'update',
              draft: { 
                data: newData,
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
              occurrenceImportId: additionalData.occurrence_import_id,
              data: newData,
            })
            await db.query(
              `INSERT INTO occurrences (occurrence_import_id, account_id, occurrence_id, data, id_in_source) VALUES ($1, $2, $3, $4, $5)`,
              [
                newOcc.occurrence_import_id,
                newOcc.account_id,
                newOcc.occurrence_id,
                JSON.stringify(newOcc.data),
                idInSource,
              ],
            )
            addedCount++

            store.set(addOperationAtom, {
              table: 'occurrences',
              operation: 'insert',
              draft: newOcc,
            })
          }
        }

        // Remove occurrences not in new data
        for (const [idInSource, existing] of existingMap.entries()) {
          if (!newDataMap.has(idInSource)) {
            await db.query(
              `DELETE FROM occurrences WHERE occurrence_id = $1`,
              [existing.occurrence_id],
            )
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
