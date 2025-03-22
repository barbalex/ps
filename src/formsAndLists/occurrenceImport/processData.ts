import { read, utils } from 'xlsx'
import { chunkArrayWithMinSize } from '../../modules/chunkArrayWithMinSize.ts'
import { createOccurrence } from '../../modules/createRows.ts'

export const processData = async ({ file, additionalData, db }) => {
  if (!file) return

  console.log('processData', { file, additionalData, db })
  // TODO:
  // this function is passed to the UploadButton component
  // it should process the content of the file

  const reader = new FileReader()

  reader.onload = async () => {
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
    console.log('processData, occurrences:', occurrences)
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
    // - insert data into occurrences table
    // - set occurrence_imports.created_time
    // - set occurrence_imports.inserted_count
    // - show user data rows
  }
  reader.onabort = () => console.log('file reading was aborted')
  reader.onerror = () => console.log('file reading has failed')
  reader.readAsBinaryString(file)
}
