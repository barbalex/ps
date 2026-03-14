import { read, utils, set_cptable } from '@e965/xlsx'
import * as cptable from '@e965/xlsx/dist/cpexcel.full.mjs'
import { chunkArrayWithMinSize } from '../../modules/chunkArrayWithMinSize.ts'
import { createObservation } from '../../modules/createRows.ts'
import { addOperationAtom, store, intlAtom } from '../../store.ts'
import { backgroundTasks } from '../../modules/backgroundTasks.ts'
import { checkDuplicates } from './checkDuplicates.ts'

set_cptable(cptable)

// Helper function to insert observations
const insertObservations = async (data, additionalData, db, resolve) => {
  const observations = data.map((dat) =>
    createObservation({
      observationImportId: additionalData.observation_import_id,
      data: dat,
    }),
  )

  const intl = store.get(intlAtom)
  const taskId = `import-observations-${additionalData.observation_import_id}`
  backgroundTasks.add(
    taskId,
    intl?.formatMessage({
      id: 'bgTkImp',
      defaultMessage: 'Importiere Beobachtungen',
    }) ?? 'Importiere Beobachtungen',
    observations.length,
  )

  const chunked = chunkArrayWithMinSize(observations, 500)
  let processed = 0
  try {
    for (const chunk of chunked) {
      const values = chunk
        .map(
          (c) =>
            `('${c.observation_import_id}', '${c.account_id}', '${
              c.observation_id
            }', '${JSON.stringify(c.data)}')`,
        )
        .join(',')
      await db.query(
        `INSERT INTO observations (observation_import_id, account_id, observation_id, data) VALUES ${values}`,
      )
      processed += chunk.length
      backgroundTasks.updateProgress(taskId, processed)
      // Allow UI to update between chunks
      await new Promise((r) => setTimeout(r, 0))
    }
    // same for server
    for (const chunk of chunked) {
      store.set(addOperationAtom, {
        table: 'observations',
        operation: 'insertMany',
        draft: chunk,
      })
    }
    backgroundTasks.complete(taskId)
    resolve({
      success: true,
      message:
        intl?.formatMessage(
          { id: 'oBsImpM', defaultMessage: '{count} Beobachtungen importiert' },
          { count: observations.length },
        ) ?? `${observations.length} Beobachtungen importiert`,
    })
  } catch (error) {
    backgroundTasks.error(taskId, error.message)
    throw error
  }
}

export const processData = async ({
  file,
  additionalData,
  db,
  onDuplicatesFound,
}) => {
  if (!file) return { success: false, message: 'No file selected' }

  // console.log('processData', { file, additionalData, db })
  // TODO:
  // this function is passed to the UploadButton component
  // it should process the content of the file

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async () => {
      try {
        const fileAsArrayBuffer = reader.result
        const workbook = read(fileAsArrayBuffer, {
            type: 'array',
            codepage: 65001, // UTF-8
            cellText: false,
            cellDates: true,
          }),
          sheetName = workbook.SheetNames[0],
          worksheet = workbook.Sheets[sheetName]
        const data = utils.sheet_to_json(worksheet).map((d) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { __rowNum__, ...rest } = d
          return rest
        })

        // Check for duplicates
        const duplicateCount = await checkDuplicates(
          db,
          data,
          additionalData.account_id,
        )

        if (duplicateCount > 0) {
          // Call the callback to show the dialog
          onDuplicatesFound(
            duplicateCount,
            data.length,
            // Continue callback
            async () => {
              try {
                await insertObservations(data, additionalData, db, resolve)
              } catch (error) {
                reject(error)
              }
            },
            // Cancel callback
            () => {
              resolve({
                success: false,
                message: 'Import cancelled by user',
              })
            },
          )
          return
        }

        // No duplicates, proceed with import
        await insertObservations(data, additionalData, db, resolve)
      } catch (error) {
        reject(error)
      }
    }

    reader.onabort = () => reject(new Error('File reading was aborted'))
    reader.onerror = () => reject(new Error('File reading has failed'))
    reader.readAsArrayBuffer(file)
  })
}
