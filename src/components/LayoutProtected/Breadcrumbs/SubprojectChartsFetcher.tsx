import { useChartsNavData } from '../../../modules/useChartsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

// like ChartsFetcher, but for the project-level templates section
// ("charts for subprojects")
export const SubprojectChartsFetcher = ({
  params,
  ...other
}: {
  params: Parameters<typeof useChartsNavData>[0]
}) => {
  const { navData: navDataRaw } = useChartsNavData({
    ...params,
    forSubprojects: true,
    section: 'subproject-charts',
  })
  const navData = navDataRaw as typeof navDataRaw & { id?: string }

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
