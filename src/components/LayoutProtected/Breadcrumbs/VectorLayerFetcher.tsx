import { useVectorLayerNavData } from '../../../modules/useVectorLayerNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const VectorLayerFetcher = ({ params, ...other }) => {
  const { navData } = useVectorLayerNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
