import { useExportsNavData } from '../../../modules/useExportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ExportsFetcher = ({ params, ...other }) => {
  const { navData } = useExportsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
