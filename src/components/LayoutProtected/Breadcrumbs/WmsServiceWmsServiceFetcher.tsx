import { useWmsServiceWmsServiceNavData } from '../../../modules/useWmsServiceWmsServiceNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WmsServiceWmsServiceFetcher = ({ params, ...other }) => {
  const { navData } = useWmsServiceWmsServiceNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
