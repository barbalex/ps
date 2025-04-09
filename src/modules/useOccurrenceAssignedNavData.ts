import { useOccurrenceNavData } from './useOccurrenceNavData.ts'

export const useOccurrenceNotToAssiguseOccurrenceAssignedNavDatanNavData = ({
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
    isNotToAssign: false,
  })
