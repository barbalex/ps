import { memo } from 'react'

import { usePlaceCheckReportQuantityNavData } from '../../../modules/usePlaceCheckReportQuantityNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PlaceCheckReportQuantityFetcher = memo(
  ({ params, ...other }: { params: Record<string, string> }) => {
    const { navData } = usePlaceCheckReportQuantityNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
