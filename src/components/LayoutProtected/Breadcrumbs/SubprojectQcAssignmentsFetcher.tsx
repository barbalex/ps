import { useSubprojectQcAssignmentsNavData } from '../../../modules/useSubprojectQcAssignmentsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useSubprojectQcAssignmentsNavData>[0]
}

export const SubprojectQcAssignmentsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useSubprojectQcAssignmentsNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
