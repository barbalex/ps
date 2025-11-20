import { useListValuesNavData } from '../../../modules/useListValuesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ListValuesFetcher = ({ params, ...other }) => {
  const { navData } = useListValuesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
