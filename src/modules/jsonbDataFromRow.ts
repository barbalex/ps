// need to extract the jsonb data from the row
// as inside filters it's name is a path
// instead of it being inside of the data field
export const jsonbDataFromRow = (row) =>
  row.data ??
  Object.entries(row)
    .filter(([name]) => name.startsWith('data.'))
    .reduce((acc, [name, value]) => {
      acc[name.replace('data.', '')] = value
      return acc
    }, {})
