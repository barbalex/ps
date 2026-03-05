import { useObservationToAssessNavData } from '../../../modules/useObservationToAssessNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ObservationToAssessFetcher = ({ params, ...other }) => {
  const { navData } = useObservationToAssessNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
