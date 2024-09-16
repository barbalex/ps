const sqlFromFilterObject = ({ filter, columnPrefix = '' }) => {
  let sql = ``
  for (const key in filter) {
    const value = filter[key]
    // value can be a basic value or an object using contains
    if (value?.contains) {
      sql += `${columnPrefix}${key} LIKE '%${value.contains}%'`
      continue
    }
    sql += `${columnPrefix}${key} = ${value}`
  }
  return sql
}

// receives a filter, for instance: wmsLayersFilter
// returns a sql string for a where clause
// if this were a server, we would need to separate args and pass both the sql and the args back
// but: the worst that can happen is that a malicious user hacks their own data...
export const sqlFromFilter = ({ filter, columnPrefix }) => {
  if (!filter) return undefined
  if (filter?.length === 0) return undefined

  if (filter?.label) {
    return sqlFromFilter(filter)
  }

  return `(${filter
    .map((f) => sqlFromFilterObject({ filter: f, columnPrefix }))
    .join(') OR (')})`
}
