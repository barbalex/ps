import { useObservationsToAssessNavData } from '../../../modules/useObservationsToAssessNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ObservationsToAssessFetcher = ({ params, ...other }) => {
  const { navData } = useObservationsToAssessNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
