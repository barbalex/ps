import { useWmsLayerWmsLayerNavData } from '../../../modules/useWmsLayerWmsLayerNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WmsLayerWmsLayerFetcher = ({ params, ...other }) => {
  const { navData } = useWmsLayerWmsLayerNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
