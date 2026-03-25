import { useRootQcsRunNavData } from '../../../modules/useRootQcsRunNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const RootQcsRunFetcher = ({ params, ...other }) => {
  const { navData } = useRootQcsRunNavData()

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
