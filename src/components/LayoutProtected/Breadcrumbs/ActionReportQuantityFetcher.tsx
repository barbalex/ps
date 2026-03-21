import { useActionReportQuantityNavData } from '../../../modules/useActionReportQuantityNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionReportQuantityFetcher = ({ params, ...other }) => {
  const { navData } = useActionReportQuantityNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
