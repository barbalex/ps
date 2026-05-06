import { useProjectExportsNavData } from '../../../modules/useProjectExportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectExportsFetcher = ({ params, ...other }) => {
  const { navData } = useProjectExportsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
