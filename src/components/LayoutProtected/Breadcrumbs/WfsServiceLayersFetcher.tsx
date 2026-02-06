import { useWfsServiceLayersNavData } from '../../../modules/useWfsServiceLayersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WfsServiceLayersFetcher = ({ params, ...other }) => {
  const { navData } = useWfsServiceLayersNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
