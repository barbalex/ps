import { useChartSubjectsNavData } from '../../../modules/useChartSubjectsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ChartSubjectsFetcher = ({ params, ...other }) => {
  const { navData } = useChartSubjectsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
