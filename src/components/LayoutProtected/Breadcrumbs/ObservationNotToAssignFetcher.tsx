import { useObservationNotToAssignNavData } from '../../../modules/useObservationNotToAssignNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ObservationNotToAssignFetcher = ({ params, ...other }) => {
  const { navData } = useObservationNotToAssignNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
