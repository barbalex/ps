export const orFilterToSql = (orFilter) => {
  // orFilter is object with keys: column, value
  // need to return a string with the sql where clause
  // loop through the keys and values, creating the where clause
  // text fields are filtered with ilike
  // numbers, dates and uuids with =
  const whereClauses = Object.entries(orFilter).map(([column, value]) => {
    // if column starts with 'data.', remove that
    const columnName = column.startsWith('data.') ? column.substring(4) : column
    if (typeof value === 'string') {
      return `${columnName} ilike '%${value}%'`
    }
    if (value === null || value === undefined || value === '') {
      return `${columnName} IS NULL`
    }
    return `${columnName} = ${value}`
  })
  return whereClauses.join(' AND ')
}
