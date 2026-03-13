import { useChartSettingsNavData } from '../../../modules/useChartSettingsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const ChartSettingsFetcher = ({ params, ...other }) => {
  const { navData } = useChartSettingsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
