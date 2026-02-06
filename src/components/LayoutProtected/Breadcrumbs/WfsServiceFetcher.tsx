import { useWfsServiceNavData } from '../../../modules/useWfsServiceNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const WfsServiceFetcher = ({ params, ...other }) => {
  const { navData } = useWfsServiceNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
