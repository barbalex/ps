import { useOccurrencesNavData } from './useOccurrencesNavData.ts'

export const useOccurrencesAssignedNavData = ({
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
    isNotToAssign: false,
  })
