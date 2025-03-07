export const orFilterToSql = (orFilter) => {
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
    const columnDescriptor = isData ? `data ->> '${columnName}'` : columnName
    if (typeof value === 'string') {
      return `${columnDescriptor} ilike '%${value}%'`
    }
    if (value === null || value === undefined || value === '') {
      return `${columnDescriptor} IS NULL`
    }
    if (typeof value === 'boolean') {
      return `(${columnDescriptor})::boolean IS ${value}`
    }
    if (!isNaN(value)) {
      return `(${columnDescriptor})::numeric = ${value}`
    }
    return `${columnDescriptor} = ${value}`
  })
  const sql = whereClauses.join(' AND ')
  console.log('orFilterToSql', { orFilter, whereClauses, sql })
  return sql
}
