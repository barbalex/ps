import { useSubprojectQcAssignmentsNavData } from '../../../modules/useSubprojectQcAssignmentsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectQcsAssignmentFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectQcAssignmentsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
