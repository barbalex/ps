import { memo } from 'react'

import { useActionReportReportNavData } from '../../../modules/useActionReportReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionReportReportFetcher = memo(
  ({ params, ...other }: { params: Record<string, string> }) => {
    const { navData } = useActionReportReportNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
