import { useProjectReportsNavData } from '../../../modules/useProjectReportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectReportsFetcher = ({ params, ...other }) => {
  const { navData } = useProjectReportsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
