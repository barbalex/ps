import { useChartSubjectNavData } from '../../../modules/useChartSubjectNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

// like ChartSubjectFetcher, but for the project-level templates section
// ("charts for subprojects")
export const SubprojectChartSubjectFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useChartSubjectNavData({
    ...params,
    section: 'subproject-charts',
  } as Parameters<typeof useChartSubjectNavData>[0])

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
