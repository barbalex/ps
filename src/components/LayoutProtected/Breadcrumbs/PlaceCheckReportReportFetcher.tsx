import { memo } from 'react'

import { usePlaceCheckReportReportNavData } from '../../../modules/usePlaceCheckReportReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceCheckReportReportFetcher = memo(
  ({ params, ...other }: { params: Record<string, string> }) => {
    const { navData } = usePlaceCheckReportReportNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
