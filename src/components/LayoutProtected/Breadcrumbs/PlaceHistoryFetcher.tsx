import { usePlaceHistoryNavData } from '../../../modules/usePlaceHistoryNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceHistoryFetcher = ({ params, ...other }) => {
  const { navData } = usePlaceHistoryNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
