import { usePlaceReportsNavData } from '../../../modules/usePlaceReportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceReportsFetcher = ({ params, ...other }) => {
  const { navData } = usePlaceReportsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
