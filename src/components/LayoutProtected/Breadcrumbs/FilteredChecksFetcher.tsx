import { useFilteredChecksNavData } from '../../../modules/useFilteredChecksNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useFilteredChecksNavData>[0]
}

export const FilteredChecksFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useFilteredChecksNavData(params)
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
