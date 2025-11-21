import { useActionReportValuesNavData } from '../../../modules/useActionReportValuesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionReportValuesFetcher = ({ params, ...other }) => {
  const { navData } = useActionReportValuesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
