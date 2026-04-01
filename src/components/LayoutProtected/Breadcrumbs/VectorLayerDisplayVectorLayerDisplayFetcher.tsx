import { useVectorLayerDisplayVectorLayerDisplayNavData } from '../../../modules/useVectorLayerDisplayVectorLayerDisplayNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const VectorLayerDisplayVectorLayerDisplayFetcher = ({ params, ...other }) => {
  const { navData } = useVectorLayerDisplayVectorLayerDisplayNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
