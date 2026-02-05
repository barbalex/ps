import { read, utils } from '@e965/xlsx'
import { chunkArrayWithMinSize } from '../../modules/chunkArrayWithMinSize.ts'
import { createOccurrence } from '../../modules/createRows.ts'
import { addOperationAtom, store } from '../../store.ts'

export const processData = async ({ file, additionalData, db }) => {
  if (!file) return { success: false, message: 'No file selected' }

  // console.log('processData', { file, additionalData, db })
  // TODO:
  // this function is passed to the UploadButton component
  // it should process the content of the file

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async () => {
      try {
        const fileAsBinaryString = reader.result
        const workbook = read(fileAsBinaryString, {
            type: 'binary',
            // need this for utf-8 encoding
            codepage: 65001,
          }),
          sheetName = workbook.SheetNames[0],
          worksheet = workbook.Sheets[sheetName]
        const data = utils.sheet_to_json(worksheet).map((d) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { __rowNum__, ...rest } = d
          return rest
        })
        const occurrences = data.map((dat) =>
          createOccurrence({
            occurrenceImportId: additionalData.occurrence_import_id,
            data: dat,
          }),
        )
        // test the data
        // console.log('processData, occurrences:', occurrences)
        // TODO:
        // - create chunks of 500 rows
        const chunked = chunkArrayWithMinSize(occurrences, 500)
        for (const chunk of chunked) {
          const values = chunk
            .map(
              (c) =>
                `('${c.occurrence_import_id}', '${c.account_id}', '${
                  c.occurrence_id
                }', '${JSON.stringify(c.data)}')`,
            )
            .join(',')
          await db.query(
            `INSERT INTO occurrences (occurrence_import_id, account_id, occurrence_id, data) VALUES ${values}`,
          )
        }
        // same for server
        for (const chunk of chunked) {
          store.set(addOperationAtom, {
            table: 'occurrences',
            operation: 'insertMany',
            draft: chunk,
          })
        }
        // - insert data into occurrences table
        // - set occurrence_imports.created_time
        // - set occurrence_imports.inserted_count
        // - show user data rows
        resolve({
          success: true,
          message: `Successfully imported ${occurrences.length} occurrence${occurrences.length !== 1 ? 's' : ''}`,
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onabort = () => reject(new Error('File reading was aborted'))
    reader.onerror = () => reject(new Error('File reading has failed'))
    reader.readAsBinaryString(file)
  })
}
