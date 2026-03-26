import { memo } from 'react'

import { usePlaceActionReportReportNavData } from '../../../modules/usePlaceActionReportReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceActionReportReportFetcher = memo(
  ({ params, ...other }: { params: Record<string, string> }) => {
    const { navData } = usePlaceActionReportReportNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
