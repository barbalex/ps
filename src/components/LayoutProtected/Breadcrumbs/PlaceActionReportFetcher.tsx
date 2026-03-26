import { usePlaceActionReportNavData } from '../../../modules/usePlaceActionReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceActionReportFetcher = ({ params, ...other }) => {
  const { navData } = usePlaceActionReportNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
