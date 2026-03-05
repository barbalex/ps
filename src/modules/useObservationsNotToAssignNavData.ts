import { useObservationsNavData } from './useObservationsNavData.ts'

export const useObservationsNotToAssignNavData = ({
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
    isNotToAssign: true,
  })
