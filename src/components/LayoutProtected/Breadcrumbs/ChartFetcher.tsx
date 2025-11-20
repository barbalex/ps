import { useChartNavData } from '../../../modules/useChartNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ChartFetcher = ({ params, ...other }) => {
  const { navData } = useChartNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
