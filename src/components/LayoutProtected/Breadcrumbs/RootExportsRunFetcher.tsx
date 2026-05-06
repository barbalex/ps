import { useRootExportsRunNavData } from '../../../modules/useRootExportsRunNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const RootExportsRunFetcher = ({ params, ...other }) => {
  const { navData } = useRootExportsRunNavData()

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
