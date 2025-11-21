import { useCheckValueNavData } from '../../../modules/useCheckValueNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckValueFetcher = ({ params, ...other }) => {
  const { navData } = useCheckValueNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
