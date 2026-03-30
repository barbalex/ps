import { memo } from 'react'

import { useCheckReportQuantityNavData } from '../../../modules/useCheckReportQuantityNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckReportQuantityFetcher = memo(
  ({ params, ...other }: { params: Record<string, string> }) => {
    const { navData } = useCheckReportQuantityNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
