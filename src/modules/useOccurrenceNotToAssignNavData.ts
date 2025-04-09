import { useOccurrenceNavData } from './useOccurrenceNavData.ts'

export const useOccurrenceNotToAssignNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  occurrenceId,
}) =>
  useOccurrenceNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    occurrenceId,
    isToAssess: false,
    isNotToAssign: true,
  })
