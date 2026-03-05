import { useObservationsNotToAssignNavData } from '../../../modules/useObservationsNotToAssignNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ObservationsNotToAssignFetcher = ({ params, ...other }) => {
  const { navData } = useObservationsNotToAssignNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
