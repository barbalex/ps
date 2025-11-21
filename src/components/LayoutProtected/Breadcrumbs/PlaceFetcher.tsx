import { usePlaceNavData } from '../../../modules/usePlaceNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceFetcher = ({ params, ...other }) => {
  const { navData } = usePlaceNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
