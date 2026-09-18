import { useListsNavData } from '../../../modules/useListsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: {
    projectId: string
  }
}

export const ListsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useListsNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
