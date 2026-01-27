import { memo } from 'react'

import { usePlaceReportReportNavData } from '../../../modules/usePlaceReportReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceReportReportFetcher = memo(
  ({ params, ...other }: { params: Record<string, string> }) => {
    const { navData } = usePlaceReportReportNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
