import { useWmsServiceLayersNavData } from '../../../modules/useWmsServiceLayersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WmsServiceLayersFetcher = ({ params, ...other }) => {
  const { navData } = useWmsServiceLayersNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
