import { useExportNavData } from '../../../modules/useExportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ExportFetcher = ({ params, ...other }) => {
  const { navData } = useExportNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
