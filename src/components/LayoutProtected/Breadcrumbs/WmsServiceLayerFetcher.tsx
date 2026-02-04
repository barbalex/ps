import { useWmsServiceLayerNavData } from '../../../modules/useWmsServiceLayerNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WmsServiceLayerFetcher = ({ params, ...other }) => {
  const { navData } = useWmsServiceLayerNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
