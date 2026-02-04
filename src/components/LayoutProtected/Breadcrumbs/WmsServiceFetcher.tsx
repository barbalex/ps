import { useWmsServiceNavData } from '../../../modules/useWmsServiceNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WmsServiceFetcher = ({ params, ...other }) => {
  const { navData } = useWmsServiceNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
