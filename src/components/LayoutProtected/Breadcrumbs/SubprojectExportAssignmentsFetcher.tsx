import { useSubprojectExportAssignmentsNavData } from '../../../modules/useSubprojectExportAssignmentsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectExportAssignmentsFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectExportAssignmentsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
