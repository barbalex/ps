import { useWfsServiceLayerNavData } from '../../../modules/useWfsServiceLayerNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WfsServiceLayerFetcher = ({ params, ...other }) => {
  const { navData } = useWfsServiceLayerNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
