import { useProjectQcAssignmentsNavData } from '../../../modules/useProjectQcAssignmentsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectQcsAssignmentFetcher = ({ params, ...other }) => {
  const { navData } = useProjectQcAssignmentsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
