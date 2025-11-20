import { useWmsLayersNavData } from '../../../modules/useWmsLayersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WmsLayersFetcher = ({ params, ...other }) => {
  const { navData } = useWmsLayersNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
