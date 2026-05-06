import { useRootExportsNavData } from '../../../modules/useRootExportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const RootExportsFetcher = ({ params, ...other }) => {
  const { navData } = useRootExportsNavData()

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
