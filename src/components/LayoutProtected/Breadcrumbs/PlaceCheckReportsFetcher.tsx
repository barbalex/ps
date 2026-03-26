import { usePlaceCheckReportsNavData } from '../../../modules/usePlaceCheckReportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceCheckReportsFetcher = ({ params, ...other }) => {
  const { navData } = usePlaceCheckReportsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
