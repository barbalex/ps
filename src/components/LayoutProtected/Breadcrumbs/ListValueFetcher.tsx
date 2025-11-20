import { useListValueNavData } from '../../../modules/useListValueNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ListValueFetcher = ({ params, ...other }) => {
  const { navData } = useListValueNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
