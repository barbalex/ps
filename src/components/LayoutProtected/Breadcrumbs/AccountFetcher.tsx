import { useAccountNavData } from '../../../modules/useAccountNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const AccountFetcher = ({ params, ...other }) => {
  const { navData } = useAccountNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
