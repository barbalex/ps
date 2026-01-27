import { useChartChartNavData } from '../../../modules/useChartChartNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ChartChartFetcher = ({ params, ...other }) => {
  const { navData } = useChartChartNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
