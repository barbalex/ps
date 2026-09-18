import { useObservationAssignedNavData } from '../../../modules/useObservationAssignedNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    subprojectId: string
    placeId?: string
    placeId2?: string
    observationId: string
  }
}

export const ObservationAssignedFetcher = ({ params, ...other }: Props) => {
  const { navData } = useObservationAssignedNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
