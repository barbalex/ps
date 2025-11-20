import { useListsNavData } from '../../../modules/useListsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ListsFetcher = ({ params, ...other }) => {
  const { navData } = useListsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
