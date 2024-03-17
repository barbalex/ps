import { read, utils } from 'xlsx'

export const processData = async (file) => {
  if (!file) return
  console.log('processData, file:', file)
  // TODO:
  // this function is passed to the UploadButton component
  // it should process the content of the file

  const reader = new FileReader()

  reader.onload = () => {
    const fileAsBinaryString = reader.result
    const workbook = read(fileAsBinaryString, {
        type: 'binary',
      }),
      sheetName = workbook.SheetNames[0],
      worksheet = workbook.Sheets[sheetName]
    const data = utils.sheet_to_json(worksheet).map((d) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { __rowNum__, ...rest } = d
      return rest
    })
    // test the data
    console.log('processData, data:', data)
    // TODO: show user data rows
    // TODO: let user choose id field
    // TODO: let user choose geometry field(s)
    // TODO: let user choose projection
    // TODO: let user choose how to create label from fields
    // TODO: Maybe tell user what is expected in the file instead
  }
  reader.onabort = () => console.log('file reading was aborted')
  reader.onerror = () => console.log('file reading has failed')
  reader.readAsBinaryString(file)
}
