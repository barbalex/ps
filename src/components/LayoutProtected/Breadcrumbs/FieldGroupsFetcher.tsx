import { useFieldGroupsNavData } from '../../../modules/useFieldGroupsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useFieldGroupsNavData>[0]
}

export const FieldGroupsFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useFieldGroupsNavData(params)
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
