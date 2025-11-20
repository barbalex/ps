import { useChartSubjectNavData } from '../../../modules/useChartSubjectNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ChartSubjectFetcher = ({ params, ...other }) => {
  const { navData } = useChartSubjectNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
