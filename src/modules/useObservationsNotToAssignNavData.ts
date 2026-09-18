import { useObservationsNavData } from './useObservationsNavData.ts'

export const useObservationsNotToAssignNavData = ({
  projectId,
  subprojectId,
  placeId,
  placeId2,
}: {
  projectId: string
  subprojectId: string
  placeId?: string
  placeId2?: string
}) =>
  useObservationsNavData({
    projectId,
    subprojectId,
    placeId,
    placeId2,
    isToAssess: false,
    isNotToAssign: true,
  })
