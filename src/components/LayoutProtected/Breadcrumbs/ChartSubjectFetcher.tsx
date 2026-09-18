import { useChartSubjectNavData } from '../../../modules/useChartSubjectNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ChartSubjectFetcher = ({
  params,
  ...other
}: {
  params: Record<string, string>
}) => {
  const { navData } = useChartSubjectNavData(
    params as Parameters<typeof useChartSubjectNavData>[0],
  )

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
