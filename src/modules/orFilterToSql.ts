import isUuid from 'is-uuid'

export const orFilterToSql = (
  orFilter: Record<string, unknown>,
  tablePrefix: string,
) => {
  // orFilter is object with keys: column, value
  // need to return a string with the sql where clause
  // loop through the keys and values, creating the where clause
  // text fields are filtered with ilike
  // numbers, dates and uuids with =
  const whereClauses = Object.entries(orFilter).map(([column, value]) => {
    // if column starts with 'data.', remove that
    // data->>'column' = 'true'
    const isData = column.startsWith('data.')
    const columnName = isData ? column.substring(5) : column
    let columnDescriptor = isData ? `data ->> '${columnName}'` : columnName
    if (tablePrefix) {
      columnDescriptor = `${tablePrefix}.${columnDescriptor}`
    }
    if (isUuid.anyNonNil(value)) {
      return `${columnDescriptor}::uuid = '${value}'`
    }
    // cast text and filter with ilike
    if (typeof value === 'string') {
      // return `${columnDescriptor}::text ILIKE '${value}'`
      return `${columnDescriptor}::text ILIKE '%${value}%'`
    }
    // set nulls the right way
    if (value === null || value === undefined || value === '') {
      return `${columnDescriptor} IS NULL`
    }
    // correctly cast booleans
    if (typeof value === 'boolean') {
      return `${columnDescriptor}::boolean IS ${value}`
    }
    // correctly cast numbers
    if (!isNaN(value)) {
      return `${columnDescriptor}::numeric = ${value}`
    }
    // catch all others
    return `${columnDescriptor} = ${value}`
  })
  const sql =
    whereClauses.length > 1
      ? `(${whereClauses.join(' AND ')})`
      : whereClauses.join(' AND ')

  return sql
}
