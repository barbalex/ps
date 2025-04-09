import { useOccurrencesNavData } from './useOccurrencesNavData.ts'

export const useOccurrencesNotToAssignNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
}) =>
  useOccurrencesNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    isToAssess: false,
    isNotToAssign: true,
  })
