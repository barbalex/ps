import { useListNavData } from '../../../modules/useListNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    listId: string
  }
}

export const ListFetcher = ({ params, ...other }: Props) => {
  const { navData } = useListNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
