import { useRootQcsRunNavData } from '../../../modules/useRootQcsRunNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Record<string, string>
}

export const RootQcsRunFetcher = ({ params, ...other }: Props) => {
  const { navData } = useRootQcsRunNavData()

  return (
    <FetcherReturner
      key={`${(navData as { id?: string })?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
