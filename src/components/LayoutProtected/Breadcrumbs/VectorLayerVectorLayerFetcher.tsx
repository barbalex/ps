import { useVectorLayerVectorLayerNavData } from '../../../modules/useVectorLayerVectorLayerNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const VectorLayerVectorLayerFetcher = ({ params, ...other }) => {
  const { navData } = useVectorLayerVectorLayerNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
