import { useParams, useSearch } from '@tanstack/react-router'

export const useOwnLayerScope = () => {
  const { projectId, subprojectId: routeSubproject } = useParams({
    strict: false,
  })
  const overview = useSearch({
    from: '/data',
    select: (search) => search.mapOverview,
  })
  const subprojectId = overview === projectId ? undefined : routeSubproject
  return {
    projectId,
    subprojectId,
    scopeId: subprojectId ?? projectId ?? null,
    scopeFilter:
      subprojectId ? '= $1' : (
        'IN (SELECT subproject_id FROM subprojects WHERE project_id = $1)'
      ),
    // The form route must name its subproject, even when opened from an overview.
    formSearch: { mapOverview: subprojectId ? undefined : projectId },
  }
}
