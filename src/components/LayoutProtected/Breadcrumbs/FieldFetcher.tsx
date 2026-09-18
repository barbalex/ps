import { useFieldNavData } from '../../../modules/useFieldNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useFieldNavData>[0]
}

export const FieldFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useFieldNavData(params)
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
