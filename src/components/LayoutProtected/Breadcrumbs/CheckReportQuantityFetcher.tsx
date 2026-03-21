import { useCheckReportQuantityNavData } from '../../../modules/useCheckReportQuantityNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckReportQuantityFetcher = ({ params, ...other }) => {
  const { navData } = useCheckReportQuantityNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
