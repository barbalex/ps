import { memo } from 'react'

import { useActionReportQuantityNavData } from '../../../modules/useActionReportQuantityNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ActionReportQuantityFetcher = memo(
  ({ params, ...other }: { params: Record<string, string> }) => {
    const { navData } = useActionReportQuantityNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
