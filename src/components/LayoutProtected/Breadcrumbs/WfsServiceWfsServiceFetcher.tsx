import { useWfsServiceWfsServiceNavData } from '../../../modules/useWfsServiceWfsServiceNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WfsServiceWfsServiceFetcher = ({ params, ...other }) => {
  const { navData } = useWfsServiceWfsServiceNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
