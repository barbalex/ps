const sqlFromFilterObject = ({ filter, columnPrefix }) => {
  console.log('sqlFromFilterObject, filter:', filter)
  let sql = ``
  for (const key in filter) {
    const value = filter[key]
    console.log('sqlFromFilterObject 2', { key, value })
    // value can be a basic value or an object using contains
    if (value?.contains) {
      sql += `${columnPrefix ?? ''}${key} LIKE '%${value.contains}%'`
      continue
    }
    sql += `${columnPrefix ?? ''}${key} = ${value}`
  }
  return sql
}

// receives a filter, for instance: appState?.filter_tile_layers
// returns a sql string for a where clause
export const sqlFromFilter = ({ filter, columnPrefix }) => {
  console.log('sqlFromFilter, filter:', filter)
  if (!filter) return undefined

  if (filter?.label) {
    return sqlFromFilter(filter)
  }

  return `(${filter
    .map((f) => sqlFromFilterObject({ filter: f, columnPrefix }))
    .join(') OR (')})`
}
