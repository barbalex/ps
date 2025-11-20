import { useVectorLayerDisplayNavData } from '../../../modules/useVectorLayerDisplayNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const VectorLayerDisplayFetcher = ({ params, ...other }) => {
  const { navData } = useVectorLayerDisplayNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
