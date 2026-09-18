import { useObservationNavData } from './useObservationNavData.ts'

export const useObservationNotToAssignNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
  observationId,
}: {
  projectId: string
  subprojectId: string
  placeId?: string
  placeId2?: string
  observationId: string
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
