import { useOccurrencesNavData } from './useOccurrencesNavData.ts'

export const useOccurrencesToAssessNavData = ({
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
    isToAssess: true,
    isNotToAssign: false,
  })
