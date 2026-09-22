import { useChartSubjectsNavData } from '../../../modules/useChartSubjectsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

// like ChartSubjectsFetcher, but for the project-level templates section
// ("charts for subprojects")
export const SubprojectChartSubjectsFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useChartSubjectsNavData({
    ...params,
    section: 'subproject-charts',
  } as Parameters<typeof useChartSubjectsNavData>[0])

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
