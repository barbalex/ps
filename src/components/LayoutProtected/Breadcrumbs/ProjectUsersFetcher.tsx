import { useProjectUsersNavData } from '../../../modules/useProjectUsersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectUsersFetcher = ({ params, ...other }) => {
  const { navData } = useProjectUsersNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
