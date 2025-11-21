import { usePlaceUserNavData } from '../../../modules/usePlaceUserNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceUserFetcher = ({ params, ...other }) => {
  const { navData } = usePlaceUserNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
