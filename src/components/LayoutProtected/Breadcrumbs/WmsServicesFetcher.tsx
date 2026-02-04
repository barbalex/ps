import { useWmsServicesNavData } from '../../../modules/useWmsServicesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WmsServicesFetcher = ({ params, ...other }) => {
  const { navData } = useWmsServicesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
