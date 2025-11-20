import { usePlaceLevelNavData } from '../../../modules/usePlaceLevelNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceLevelFetcher = ({ params, ...other }) => {
  const { navData } = usePlaceLevelNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
