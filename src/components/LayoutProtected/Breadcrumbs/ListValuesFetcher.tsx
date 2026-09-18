import { useListValuesNavData } from '../../../modules/useListValuesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
    listId: string
  }
}

export const ListValuesFetcher = ({ params, ...other }: Props) => {
  const { navData } = useListValuesNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
