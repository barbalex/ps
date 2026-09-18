import { useChartsNavData } from '../../../modules/useChartsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useChartsNavData>[0]
}

export const ChartsFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useChartsNavData(params)
  // navData.id does not exist on NavData; bridge type-only
  const navData = navDataRaw as typeof navDataRaw & { id?: string }

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
