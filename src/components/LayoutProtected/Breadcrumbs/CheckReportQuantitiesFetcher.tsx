import { useCheckReportQuantitiesNavData } from '../../../modules/useCheckReportQuantitiesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckReportQuantitiesFetcher = ({ params, ...other }) => {
  const { navData } = useCheckReportQuantitiesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
