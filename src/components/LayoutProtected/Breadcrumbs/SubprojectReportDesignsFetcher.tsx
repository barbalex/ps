import { useSubprojectReportDesignsNavData } from '../../../modules/useSubprojectReportDesignsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectReportDesignsFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectReportDesignsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
