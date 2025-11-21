import { useCheckValuesNavData } from '../../../modules/useCheckValuesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckValuesFetcher = ({ params, ...other }) => {
  const { navData } = useCheckValuesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
