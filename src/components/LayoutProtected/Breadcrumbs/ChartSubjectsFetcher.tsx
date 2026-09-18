import { useChartSubjectsNavData } from '../../../modules/useChartSubjectsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ChartSubjectsFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useChartSubjectsNavData(
    params as Parameters<typeof useChartSubjectsNavData>[0],
  )

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
