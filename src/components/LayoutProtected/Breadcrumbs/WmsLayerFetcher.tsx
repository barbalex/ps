import { useWmsLayerNavData } from '../../../modules/useWmsLayerNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WmsLayerFetcher = ({ params, ...other }) => {
  const { navData } = useWmsLayerNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
