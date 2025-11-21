import { usePlacesNavData } from '../../../modules/usePlacesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlacesFetcher = ({ params, ...other }) => {
  const { navData } = usePlacesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
