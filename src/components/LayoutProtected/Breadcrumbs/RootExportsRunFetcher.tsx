import { useRootExportsRunNavData } from '../../../modules/useRootExportsRunNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Record<string, string>
}

export const RootExportsRunFetcher = ({ params, ...other }: Props) => {
  const { navData } = useRootExportsRunNavData()

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
