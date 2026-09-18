import { useChartSettingsNavData } from '../../../modules/useChartSettingsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ChartSettingsFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useChartSettingsNavData(
    params as Parameters<typeof useChartSettingsNavData>[0],
  )

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
