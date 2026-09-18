import { useFieldTypeNavData } from '../../../modules/useFieldTypeNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useFieldTypeNavData>[0]
}

export const FieldTypeFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useFieldTypeNavData(params)
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
