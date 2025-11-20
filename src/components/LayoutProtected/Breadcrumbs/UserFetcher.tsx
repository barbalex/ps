import { useUserNavData } from '../../../modules/useUserNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const UserFetcher = ({ params, ...other }) => {
  const { navData } = useUserNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
