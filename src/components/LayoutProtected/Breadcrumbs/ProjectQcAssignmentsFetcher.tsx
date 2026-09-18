import { useProjectQcAssignmentsNavData } from '../../../modules/useProjectQcAssignmentsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useProjectQcAssignmentsNavData>[0]
}

export const ProjectQcAssignmentsFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useProjectQcAssignmentsNavData(params)
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
