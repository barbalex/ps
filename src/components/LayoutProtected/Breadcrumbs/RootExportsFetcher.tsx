import { useRootExportsNavData } from '../../../modules/useRootExportsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Record<string, string>
}

export const RootExportsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useRootExportsNavData()

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
