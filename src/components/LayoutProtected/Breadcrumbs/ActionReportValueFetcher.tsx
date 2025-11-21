import { useActionReportValueNavData } from '../../../modules/useActionReportValueNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionReportValueFetcher = ({ params, ...other }) => {
  const { navData } = useActionReportValueNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
