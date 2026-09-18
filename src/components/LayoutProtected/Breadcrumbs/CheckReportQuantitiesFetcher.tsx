import { memo } from 'react'

import { useCheckReportQuantitiesNavData } from '../../../modules/useCheckReportQuantitiesNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckReportQuantitiesFetcher = memo(
  ({
    params,
    ...other
  }: {
    params: Parameters<typeof useCheckReportQuantitiesNavData>[0]
  }) => {
    const { navData } = useCheckReportQuantitiesNavData(params)

    return (
      <FetcherReturner
        key={`${navData?.ownUrl}`}
        navData={navData}
        {...other}
      />
    )
  },
)
