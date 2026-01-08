import { useGoalReportValueNavData } from '../../../modules/useGoalReportValueNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const GoalReportValueFetcher = ({ params, ...other }) => {
  const { navData } = useGoalReportValueNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
