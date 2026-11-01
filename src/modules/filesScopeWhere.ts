/**
 * SQL scope of "the files of this level". A file row carries the ids of all
 * its ancestors (project, subproject, place, action/check), so a plain
 * `project_id = P` would also list every file attached to a subproject or
 * place below. The files folder of a level only shows files attached
 * DIRECTLY to it: the more specific id columns must be NULL.
 *
 * Ids are interpolated as literals (uuids), like the nav hooks do.
 */
export const filesScopeWhere = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  actionId,
  checkId,
}: {
  projectId?: string | null
  subprojectId?: string | null
  placeId?: string | null
  placeId2?: string | null
  actionId?: string | null
  checkId?: string | null
}): string => {
  if (actionId) return `action_id = '${actionId}'`
  if (checkId) return `check_id = '${checkId}'`
  const place = placeId2 ?? placeId
  if (place) {
    return `place_id = '${place}' AND action_id IS NULL AND check_id IS NULL`
  }
  if (subprojectId) {
    return `subproject_id = '${subprojectId}' AND place_id IS NULL AND action_id IS NULL AND check_id IS NULL`
  }
  if (projectId) {
    return `project_id = '${projectId}' AND subproject_id IS NULL AND place_id IS NULL AND action_id IS NULL AND check_id IS NULL`
  }
  return 'true'
}
