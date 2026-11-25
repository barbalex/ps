import { memo } from 'react'

import { useGoalReportReportNavData } from '../../../modules/useGoalReportReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const GoalReportReportFetcher = memo(
  ({
    params,
    ...other
  }: {
    params: Parameters<typeof useGoalReportReportNavData>[0]
  }) => {
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
