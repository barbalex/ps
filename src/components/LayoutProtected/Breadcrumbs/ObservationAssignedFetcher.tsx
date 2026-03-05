import { useObservationAssignedNavData } from '../../../modules/useObservationAssignedNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ObservationAssignedFetcher = ({ params, ...other }) => {
  const { navData } = useObservationAssignedNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
