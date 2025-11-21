import { usePlaceUsersNavData } from '../../../modules/usePlaceUsersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceUsersFetcher = ({ params, ...other }) => {
  const { navData } = usePlaceUsersNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
