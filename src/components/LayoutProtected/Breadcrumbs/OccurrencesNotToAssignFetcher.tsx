import { useOccurrencesNotToAssignNavData } from '../../../modules/useOccurrencesNotToAssignNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const OccurrencesNotToAssignFetcher = ({ params, ...other }) => {
  const { navData } = useOccurrencesNotToAssignNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
