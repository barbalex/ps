import { usePlaceReportValueNavData } from '../../../modules/usePlaceReportValueNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceReportValueFetcher = ({ params, ...other }) => {
  const { navData } = usePlaceReportValueNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
