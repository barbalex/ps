import { useQcNavData } from '../../../modules/useQcNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const QcFetcher = ({ params, ...other }) => {
  const { navData } = useQcNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
