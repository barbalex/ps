import { useSubprojectUsersNavData } from '../../../modules/useSubprojectUsersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectUsersFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectUsersNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
