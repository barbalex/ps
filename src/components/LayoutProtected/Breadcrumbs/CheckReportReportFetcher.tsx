import { memo } from 'react'

import { useCheckReportReportNavData } from '../../../modules/useCheckReportReportNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CheckReportReportFetcher = memo(
  ({
    params,
    ...other
  }: {
    params: Parameters<typeof useCheckReportReportNavData>[0]
  }) => {
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
