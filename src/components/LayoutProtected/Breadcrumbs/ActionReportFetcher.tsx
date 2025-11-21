import { useActionReportNavData } from '../../../modules/useActionReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionReportFetcher = ({ params, ...other }) => {
  const { navData } = useActionReportNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
