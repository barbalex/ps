import { usePlaceCheckReportNavData } from '../../../modules/usePlaceCheckReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceCheckReportFetcher = ({ params, ...other }) => {
  const { navData } = usePlaceCheckReportNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
