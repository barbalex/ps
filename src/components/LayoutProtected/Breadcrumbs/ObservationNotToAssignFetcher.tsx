import { useObservationNotToAssignNavData } from '../../../modules/useObservationNotToAssignNavData.ts'
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

export const ObservationNotToAssignFetcher = ({ params, ...other }: Props) => {
  const { navData } = useObservationNotToAssignNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
