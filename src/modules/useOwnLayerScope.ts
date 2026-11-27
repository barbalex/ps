import { useParams, useSearch } from '@tanstack/react-router'
import { useUrlFilter } from './useUrlFilter.ts'
import { useProjectAreaFilter } from './useProjectAreaFilter.ts'
import { filterStringFromFilter } from './filterStringFromFilter.ts'

export const useOwnLayerScope = () => {
  const { projectId, subprojectId: routeSubproject } = useParams({
    strict: false,
  })
  const overview = useSearch({
    from: '/data',
    select: (search) => search.mapOverview,
  })
  const [filter] = useUrlFilter('subprojects')
  const area = useProjectAreaFilter(projectId)
  const filterSql = filterStringFromFilter(filter)
  const singleRouteSelection =
    filter.length === 1 &&
    filter[0].subproject_id === routeSubproject &&
    Object.keys(filter[0]).length === 1 &&
    !!routeSubproject
  const subprojectId =
    overview === projectId || (filterSql && !singleRouteSelection) ?
      undefined
    : routeSubproject
  return {
    projectId,
    subprojectId,
    filterSql,
    scopeId: subprojectId ?? projectId ?? null,
    areaMode: area.mode,
    areaFilter: (alias: string) => area.mode === 'all' ? '' : ` AND ${area.matches(alias)}`,
    scopeFilter:
      subprojectId ? '= $1' : (
        `IN (SELECT subproject_id FROM subprojects WHERE project_id = $1${filterSql ? ` AND (${filterSql})` : ''})`
      ),
    // The form route must name its subproject, even when opened from an overview.
    formSearch: { mapOverview: subprojectId ? undefined : projectId },
  }
}
