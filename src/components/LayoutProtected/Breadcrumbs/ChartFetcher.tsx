import { useChartNavData } from '../../../modules/useChartNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ChartFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useChartNavData(
    params as Parameters<typeof useChartNavData>[0],
  )

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
