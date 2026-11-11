import { useFieldGroupNavData } from '../../../modules/useFieldGroupNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useFieldGroupNavData>[0]
}

export const FieldGroupFetcher = ({ params, ...other }: Props) => {
  const { navData: navDataRaw } = useFieldGroupNavData(params)
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
