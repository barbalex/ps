import { useListListNavData } from '../../../modules/useListListNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ListListFetcher = ({ params, ...other }) => {
  const { navData } = useListListNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
