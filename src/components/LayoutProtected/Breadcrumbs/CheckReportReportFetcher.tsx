import { useCheckReportReportNavData } from '../../../modules/useCheckReportReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckReportReportFetcher = ({ params, ...other }) => {
  const { navData } = useCheckReportReportNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
