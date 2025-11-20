import { useUnitsNavData } from '../../../modules/useUnitsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const UnitsFetcher = ({ params, ...other }) => {
  const { navData } = useUnitsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
