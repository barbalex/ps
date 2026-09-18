import { useListListNavData } from '../../../modules/useListListNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    listId: string
  }
}

export const ListListFetcher = ({ params, ...other }: Props) => {
  const { navData } = useListListNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
