import { useOccurrencesAssignedNavData } from '../../../modules/useOccurrencesAssignedNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const OccurrencesAssignedFetcher = ({ params, ...other }) => {
  const { navData } = useOccurrencesAssignedNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
