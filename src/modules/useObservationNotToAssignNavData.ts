import { useObservationNavData } from './useObservationNavData.ts'

export const useObservationNotToAssignNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  observationId,
}) =>
  useObservationNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    observationId,
    isToAssess: false,
    isNotToAssign: true,
  })
