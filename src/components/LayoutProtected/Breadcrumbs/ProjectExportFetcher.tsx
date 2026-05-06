import { useProjectExportNavData } from '../../../modules/useProjectExportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectExportFetcher = ({ params, ...other }) => {
  const { navData } = useProjectExportNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
