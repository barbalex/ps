import { useGoalReportNavData } from '../../../modules/useGoalReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const GoalReportFetcher = ({ params, ...other }) => {
  const { navData } = useGoalReportNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
