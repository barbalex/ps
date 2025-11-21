import { useGoalReportsNavData } from '../../../modules/useGoalReportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const GoalReportsFetcher = ({ params, ...other }) => {
  const { navData } = useGoalReportsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
