import { useProjectReportDesignNavData } from '../../../modules/useProjectReportDesignNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ProjectReportDesignFetcher = ({ params, ...other }) => {
  const { navData } = useProjectReportDesignNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
