import { useWfsServicesNavData } from '../../../modules/useWfsServicesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WfsServicesFetcher = ({ params, ...other }) => {
  const { navData } = useWfsServicesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
