export type ProjectAreaMode = 'all' | 'inside' | 'outside'

export const andFilters = (...conditions: string[]) =>
  conditions
    .filter(Boolean)
    .map((sql) => `(${sql})`)
    .join(' AND ')

// Keep the default path free of geometry lookups. The scalar area subquery
// is independent of the current row, so Postgres can evaluate it once.
export const projectAreaFilter = (
  projectId: string | undefined,
  mode: ProjectAreaMode,
) => {
  const active = projectId && (mode === 'inside' || mode === 'outside')
  const area = `(SELECT geometry FROM projects WHERE project_id = '${projectId?.replaceAll("'", "''")}')`
  const matches = (alias: string) =>
    active ? `project_area_matches(${alias}.geometry, ${area}, '${mode}')` : ''
  const recordsAt = (place: string) =>
    ['actions', 'checks', 'observations'].map(
      (table) =>
        `EXISTS (SELECT 1 FROM ${table} r WHERE r.place_id = ${place}.place_id AND ${matches('r')})`,
    )
  // Only the navigation tree includes nonmatching places. A level-1
  // ancestor may be needed even when only a grandchild record matches.
  const navigationPlaces = (includeChildPlaces: boolean) => {
    if (!active) return ''
    const predicates = [matches('places'), ...recordsAt('places')]
    if (includeChildPlaces)
      predicates.push(`EXISTS (SELECT 1 FROM places child
      WHERE child.parent_id = places.place_id
        AND (${[matches('child'), ...recordsAt('child')].join(' OR ')}))`)
    return `(${predicates.join(' OR ')})`
  }
  return { matches, navigationPlaces }
}
