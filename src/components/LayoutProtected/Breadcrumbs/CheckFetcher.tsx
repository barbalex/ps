import { useCheckNavData } from '../../../modules/useCheckNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckFetcher = ({ params, ...other }) => {
  const { navData } = useCheckNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
