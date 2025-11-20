import { useListNavData } from '../../../modules/useListNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ListFetcher = ({ params, ...other }) => {
  const { navData } = useListNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
