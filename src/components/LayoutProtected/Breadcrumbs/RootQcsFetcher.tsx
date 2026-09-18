import { useRootQcsNavData } from '../../../modules/useRootQcsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Record<string, string>
}

export const RootQcsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useRootQcsNavData()

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
