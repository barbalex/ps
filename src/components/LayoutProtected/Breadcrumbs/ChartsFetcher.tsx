import { useChartsNavData } from '../../../modules/useChartsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ChartsFetcher = ({ params, ...other }) => {
  const { navData } = useChartsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
