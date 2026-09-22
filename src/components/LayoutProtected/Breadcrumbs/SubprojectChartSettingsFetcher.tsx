import { useChartSettingsNavData } from '../../../modules/useChartSettingsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

// like ChartSettingsFetcher, but for the project-level templates section
// ("charts for subprojects")
export const SubprojectChartSettingsFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useChartSettingsNavData({
    ...params,
    section: 'subproject-charts',
  } as Parameters<typeof useChartSettingsNavData>[0])

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
