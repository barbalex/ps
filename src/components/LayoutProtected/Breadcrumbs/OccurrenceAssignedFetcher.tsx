import { useOccurrenceAssignedNavData } from '../../../modules/useOccurrenceAssignedNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const OccurrenceAssignedFetcher = ({ params, ...other }) => {
  const { navData } = useOccurrenceAssignedNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
