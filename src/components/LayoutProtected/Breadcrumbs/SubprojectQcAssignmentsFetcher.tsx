import { useSubprojectQcAssignmentsNavData } from '../../../modules/useSubprojectQcAssignmentsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectQcAssignmentsFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectQcAssignmentsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
