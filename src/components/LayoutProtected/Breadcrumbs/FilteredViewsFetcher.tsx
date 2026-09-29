import { useFilteredViewsNavData } from '../../../modules/useFilteredViewsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useFilteredViewsNavData>[0]
}

export const FilteredViewsFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useFilteredViewsNavData(params)
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
