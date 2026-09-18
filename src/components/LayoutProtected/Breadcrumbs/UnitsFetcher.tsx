import { useUnitsNavData } from '../../../modules/useUnitsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useUnitsNavData>[0]
}

export const UnitsFetcher = ({ params, ...other }: Props) => {
  const { navData } = useUnitsNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
