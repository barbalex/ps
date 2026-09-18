import { memo } from 'react'

import { useGoalReportReportNavData } from '../../../modules/useGoalReportReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Params = {
  projectId_: string
  subprojectId_: string
  goalId_: string
  goalReportId_: string
}

export const GoalReportReportFetcher = memo(
  ({ params, ...other }: { params: Params }) => {
    const { navData } = useGoalReportReportNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
