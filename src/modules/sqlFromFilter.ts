const sqlFromFilterObject = ({
  filter,
  columnPrefix = '',
  args = [],
  argsBeginAt,
}) => {
  let sql = ``
  for (const key in filter) {
    const value = filter[key]
    const nextArgNumber = argsBeginAt + args.length
    // value can be a basic value or an object using contains
    if (value?.contains) {
      sql += `${columnPrefix}${key} LIKE '%$${nextArgNumber}%'`
      args.push(value.contains)
      continue
    }
    sql += `${columnPrefix}${key} = $${nextArgNumber}`
    args.push(value)
  }
  return [sql, args]
}

// receives a filter, for instance: appState?.filter_tile_layers
// returns a sql string for a where clause
// if this were a server, we would need to separate args and pass both the sql and the args back
// but: the worst that can happen is that a malicious user hacks their own data...
export const sqlFromFilter = ({ filter, columnPrefix, argsBeginAt }) => {
  if (!filter) return [undefined, []]

  const args = []

  if (filter?.label) {
    return sqlFromFilterObject({ filter, columnPrefix, args, argsBeginAt })
  }

  if (filter?.length === 1)
    return sqlFromFilterObject({
      filter: filter[0],
      columnPrefix,
      args,
      argsBeginAt,
    })

  let totalSql = ``
  for (const [index, f] of filter.entries()) {
    const [sql, additionalArgs] = sqlFromFilterObject({
      filter: filter[f],
      columnPrefix,
      args,
      argsBeginAt,
    })
    args.push(...additionalArgs)
    if (index === 0) {
      totalSql += `(`
    }
    totalSql += `${sql})`
    // if not the last one, add OR
    if (index < filter.length - 1) {
      totalSql += ` OR `
    }
  }

  return [totalSql, args]
}
