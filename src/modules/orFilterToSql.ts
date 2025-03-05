export const orFilterToSql = (orFilter) => {
// orFilter is object with keys: column, value
// need to return a string with the sql where clause
// loop through the keys and values, creating the where clause
// text fields are filtered with ilike
// numbers, dates and uuids with =
  const whereClauses = Object.entries(orFilter).map(([column, value]) => {
    if (typeof value === 'string') {
      return `${column} ilike '%${value}%'`
    }
    return `${column} = ${value}`
  })
  return whereClauses.join(' AND ')
}
