import { useObservationsNavData } from './useObservationsNavData.ts'

export const useObservationsToAssessNavData = ({
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
    isToAssess: true,
    isNotToAssign: false,
  })
