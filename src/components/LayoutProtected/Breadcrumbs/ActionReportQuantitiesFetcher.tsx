import { useActionReportQuantitiesNavData } from '../../../modules/useActionReportQuantitiesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionReportQuantitiesFetcher = ({ params, ...other }) => {
  const { navData } = useActionReportQuantitiesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
