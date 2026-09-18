import { useUnitNavData } from '../../../modules/useUnitNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

type Props = {
  params: Parameters<typeof useUnitNavData>[0]
}

export const UnitFetcher = ({ params, ...other }: Props) => {
  const { navData } = useUnitNavData(params)

  return (
    <FetcherReturner
      key={`${(navData as { id?: string } | undefined)?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
