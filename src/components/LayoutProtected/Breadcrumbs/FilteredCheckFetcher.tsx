import { useFilteredCheckNavData } from '../../../modules/useFilteredCheckNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useFilteredCheckNavData>[0]
}

export const FilteredCheckFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useFilteredCheckNavData(params)
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
