import { memo } from 'react'

import { useCheckReportReportNavData } from '../../../modules/useCheckReportReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckReportReportFetcher = memo(
  ({ params, ...other }: { params: Record<string, string> }) => {
    const { navData } = useCheckReportReportNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
