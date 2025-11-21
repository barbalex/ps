import { usePlaceReportValuesNavData } from '../../../modules/usePlaceReportValuesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceReportValuesFetcher = ({ params, ...other }) => {
  const { navData } = usePlaceReportValuesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
