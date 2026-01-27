import { useActionReportReportNavData } from '../../../modules/useActionReportReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionReportReportFetcher = ({ params, ...other }) => {
  const { navData } = useActionReportReportNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
