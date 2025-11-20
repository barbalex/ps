import { useProjectReportNavData } from '../../../modules/useProjectReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectReportFetcher = ({ params, ...other }) => {
  const { navData } = useProjectReportNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
