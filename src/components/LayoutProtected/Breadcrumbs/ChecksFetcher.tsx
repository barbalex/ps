import { useChecksNavData } from '../../../modules/useChecksNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ChecksFetcher = ({ params, ...other }) => {
  const { navData } = useChecksNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
