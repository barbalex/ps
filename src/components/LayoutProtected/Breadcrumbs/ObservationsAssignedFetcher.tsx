import { useObservationsAssignedNavData } from '../../../modules/useObservationsAssignedNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ObservationsAssignedFetcher = ({ params, ...other }) => {
  const { navData } = useObservationsAssignedNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
