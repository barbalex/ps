import { useCheckReportNavData } from '../../../modules/useCheckReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckReportFetcher = ({ params, ...other }) => {
  const { navData } = useCheckReportNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
