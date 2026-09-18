import { useListValueNavData } from '../../../modules/useListValueNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    listId: string
    listValueId: string
  }
}

export const ListValueFetcher = ({ params, ...other }: Props) => {
  const { navData } = useListValueNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
