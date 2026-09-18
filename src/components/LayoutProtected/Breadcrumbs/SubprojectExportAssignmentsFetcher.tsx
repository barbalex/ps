import { useSubprojectExportAssignmentsNavData } from '../../../modules/useSubprojectExportAssignmentsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useSubprojectExportAssignmentsNavData>[0]
}

export const SubprojectExportAssignmentsFetcher = ({
  params,
  ...other
}: Props) => {
  const { navData } = useSubprojectExportAssignmentsNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
