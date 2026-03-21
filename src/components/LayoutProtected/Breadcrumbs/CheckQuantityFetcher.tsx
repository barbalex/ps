import { useCheckQuantityNavData } from '../../../modules/useCheckQuantityNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckQuantityFetcher = ({ params, ...other }) => {
  const { navData } = useCheckQuantityNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
