import { useRootQcsNavData } from '../../../modules/useRootQcsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const RootQcsFetcher = ({ params, ...other }) => {
  const { navData } = useRootQcsNavData()

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
