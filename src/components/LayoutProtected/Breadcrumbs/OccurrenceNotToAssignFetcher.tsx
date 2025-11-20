import { useOccurrenceNotToAssignNavData } from '../../../modules/useOccurrenceNotToAssignNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const OccurrenceNotToAssignFetcher = ({ params, ...other }) => {
  const { navData } = useOccurrenceNotToAssignNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
