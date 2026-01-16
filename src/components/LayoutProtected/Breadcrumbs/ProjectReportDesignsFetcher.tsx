import { useProjectReportDesignsNavData } from '../../../modules/useProjectReportDesignsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectReportDesignsFetcher = ({ params, ...other }) => {
  const { navData } = useProjectReportDesignsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
