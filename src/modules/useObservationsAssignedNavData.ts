import { useObservationsNavData } from './useObservationsNavData.ts'

export const useObservationsAssignedNavData = ({
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
    isToAssess: false,
    isNotToAssign: false,
  })
