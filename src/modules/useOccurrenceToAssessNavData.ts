import { useOccurrenceNavData } from './useOccurrenceNavData.ts'

export const useOccurrenceToAssessNavData = ({
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
    isToAssess: true,
    isNotToAssign: false,
  })
