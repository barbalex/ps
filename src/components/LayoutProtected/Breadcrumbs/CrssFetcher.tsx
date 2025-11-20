import { useCrssNavData } from '../../../modules/useCrssNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CrssFetcher = ({ params, ...other }) => {
  const { navData } = useCrssNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
