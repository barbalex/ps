import { memo } from 'react'

import { useGoalGoalNavData } from '../../../modules/useGoalGoalNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Params = {
  projectId_: string
  subprojectId_: string
  goalId_: string
}

export const GoalGoalFetcher = memo(
  ({ params, ...other }: { params: Params }) => {
    const { navData } = useGoalGoalNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
