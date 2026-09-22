import { useChartNavData } from '../../../modules/useChartNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

// like ChartFetcher, but for the project-level templates section
// ("charts for subprojects")
export const SubprojectChartFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useChartNavData({
    ...params,
    section: 'subproject-charts',
  } as Parameters<typeof useChartNavData>[0])

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
