import { useCheckReportsNavData } from '../../../modules/useCheckReportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckReportsFetcher = ({ params, ...other }) => {
  const { navData } = useCheckReportsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
