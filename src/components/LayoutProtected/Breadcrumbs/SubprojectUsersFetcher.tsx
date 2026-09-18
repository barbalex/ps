import { useSubprojectUsersNavData } from '../../../modules/useSubprojectUsersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useSubprojectUsersNavData>[0]
}

export const SubprojectUsersFetcher = ({ params, ...other }: Props) => {
  const { navData } = useSubprojectUsersNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
