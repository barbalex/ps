import { useProjectUsersNavData } from '../../../modules/useProjectUsersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectUsersNavData>[0]
}

export const ProjectUsersFetcher = ({ params, ...other }: Props) => {
  const { navData } = useProjectUsersNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
