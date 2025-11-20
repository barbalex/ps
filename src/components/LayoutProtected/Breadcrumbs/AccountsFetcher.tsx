import { useAccountsNavData } from '../../../modules/useAccountsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const AccountsFetcher = ({ params, ...other }) => {
  const { navData } = useAccountsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
