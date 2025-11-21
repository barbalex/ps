import { useActionReportsNavData } from '../../../modules/useActionReportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionReportsFetcher = ({ params, ...other }) => {
  const { navData } = useActionReportsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
