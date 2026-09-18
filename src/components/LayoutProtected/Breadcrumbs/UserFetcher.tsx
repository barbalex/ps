import { useUserNavData } from '../../../modules/useUserNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useUserNavData>[0]
}

export const UserFetcher = ({ params, ...other }: Props) => {
  const { navData } = useUserNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
