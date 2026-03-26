import { usePlaceActionReportsNavData } from '../../../modules/usePlaceActionReportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceActionReportsFetcher = ({ params, ...other }) => {
  const { navData } = usePlaceActionReportsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
