import { useObservationsNavData } from './useObservationsNavData.ts'

export const useObservationsToAssessNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
}) =>
  useObservationsNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    isToAssess: true,
    isNotToAssign: false,
  })
