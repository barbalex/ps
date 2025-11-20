import { usePlaceLevelsNavData } from '../../../modules/usePlaceLevelsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceLevelsFetcher = ({ params, ...other }) => {
  const { navData } = usePlaceLevelsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
