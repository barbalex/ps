// Both the open list and its folder count must use exactly the same scope.
// Keep the count row even when no records match (e.g. "0/12", not "0/0").
export const spatialListQuery = ({
  open,
  select,
  from,
  where,
  filter,
  orderBy = 'label',
}: {
  open: boolean
  select: string
  from: string
  where: string
  filter: string
  orderBy?: string
}) => {
  const counts = `count(*)::int AS count_unfiltered, count(*) FILTER (WHERE included)::int AS count_filtered`
  const scoped = `SELECT ${open ? `${select},` : ''} (${filter || 'TRUE'}) AS included FROM ${from} WHERE ${where}`
  return open ?
      `WITH scoped AS (${scoped}), counts AS (SELECT ${counts} FROM scoped)
     SELECT scoped.*, counts.* FROM counts LEFT JOIN scoped ON included ORDER BY ${orderBy}`
    : `SELECT ${counts} FROM (${scoped}) scoped`
}
