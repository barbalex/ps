import { useGoalReportValuesNavData } from '../../../modules/useGoalReportValuesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const GoalReportValuesFetcher = ({ params, ...other }) => {
  const { navData } = useGoalReportValuesNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
