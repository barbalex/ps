import { usePlaceReportNavData } from '../../../modules/usePlaceReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceReportFetcher = ({ params, ...other }) => {
  const { navData } = usePlaceReportNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
