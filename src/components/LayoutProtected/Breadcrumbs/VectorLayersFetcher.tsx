import { useVectorLayersNavData } from '../../../modules/useVectorLayersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const VectorLayersFetcher = ({ params, ...other }) => {
  const { navData } = useVectorLayersNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
