import { usePlaceHistoriesNavData } from '../../../modules/usePlaceHistoriesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceHistoriesFetcher = ({ params, ...other }) => {
  const { navData } = usePlaceHistoriesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
