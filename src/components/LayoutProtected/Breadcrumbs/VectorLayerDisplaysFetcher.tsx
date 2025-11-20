import { useVectorLayerDisplaysNavData } from '../../../modules/useVectorLayerDisplaysNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const VectorLayerDisplaysFetcher = ({ params, ...other }) => {
  const { navData } = useVectorLayerDisplaysNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
