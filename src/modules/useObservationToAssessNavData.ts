import { useObservationNavData } from './useObservationNavData.ts'

export const useObservationToAssessNavData = ({
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
    isToAssess: true,
    isNotToAssign: false,
  })
