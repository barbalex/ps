import { useProjectExportAssignmentsNavData } from '../../../modules/useProjectExportAssignmentsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectExportAssignmentsNavData>[0]
}

export const ProjectExportAssignmentsFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useProjectExportAssignmentsNavData(params)
  // navData.id does not exist on NavData; bridge type-only
  const navData = navDataRaw as typeof navDataRaw & { id?: string }

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
