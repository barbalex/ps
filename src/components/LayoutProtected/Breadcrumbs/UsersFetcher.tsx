import { useUsersNavData } from '../../../modules/useUsersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const UsersFetcher = ({ params, ...other }) => {
  const { navData } = useUsersNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
