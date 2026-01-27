import { memo } from 'react'

import { useGoalGoalNavData } from '../../../modules/useGoalGoalNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const GoalGoalFetcher = memo(
  ({ params, ...other }: { params: Record<string, string> }) => {
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
