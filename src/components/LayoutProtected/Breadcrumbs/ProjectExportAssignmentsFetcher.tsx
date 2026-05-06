import { useProjectExportAssignmentsNavData } from '../../../modules/useProjectExportAssignmentsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectExportAssignmentsFetcher = ({ params, ...other }) => {
  const { navData } = useProjectExportAssignmentsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
