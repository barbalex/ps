import { useOccurrencesToAssessNavData } from '../../../modules/useOccurrencesToAssessNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const OccurrencesToAssessFetcher = ({ params, ...other }) => {
  const { navData } = useOccurrencesToAssessNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
