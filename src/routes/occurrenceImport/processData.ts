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
    const data = utils
      .sheet_to_json(worksheet)
      .map((d) => omit(d, ['__rowNum__']))
    // test the data
    console.log('processData, data:', data)
  }
  reader.onabort = () => console.log('file reading was aborted')
  reader.onerror = () => console.log('file reading has failed')
  reader.readAsBinaryString(file)
}
