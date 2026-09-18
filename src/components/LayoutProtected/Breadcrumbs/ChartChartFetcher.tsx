import { useChartChartNavData } from '../../../modules/useChartChartNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ChartChartFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useChartChartNavData(
    params as Parameters<typeof useChartChartNavData>[0],
  )

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
