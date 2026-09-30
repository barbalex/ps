// need to extract the jsonb data from the row
// as inside filters it's name is a path
// instead of it being inside of the data field
export const jsonbDataFromRow = (row: object) =>
  ((row as Record<string, unknown>).data as
    Record<string, unknown> | undefined) ??
  Object.entries(row as Record<string, unknown>)
    .filter(([name]) => name.startsWith('data.'))
    .reduce(
      (acc, [name, value]) => {
        acc[name.replace('data.', '')] = value
        return acc
      },
      {} as Record<string, unknown>,
    )
