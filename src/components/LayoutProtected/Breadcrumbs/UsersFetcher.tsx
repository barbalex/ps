import { useUsersNavData } from '../../../modules/useUsersNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Record<string, string>
}

export const UsersFetcher = ({ params, ...other }: Props) => {
  // useUsersNavData does not use params
  const useUsersNavDataWithParams = useUsersNavData as (
    params: Props['params'],
  ) => ReturnType<typeof useUsersNavData>
  const { navData } = useUsersNavDataWithParams(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
