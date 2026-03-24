import { useQcsNavData } from '../../../modules/useQcsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const QcsFetcher = ({ params, ...other }) => {
  const { navData } = useQcsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
