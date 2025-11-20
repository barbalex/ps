import { useOccurrenceToAssessNavData } from '../../../modules/useOccurrenceToAssessNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const OccurrenceToAssessFetcher = ({ params, ...other }) => {
  const { navData } = useOccurrenceToAssessNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
