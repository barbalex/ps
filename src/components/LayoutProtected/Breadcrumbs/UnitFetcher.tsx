import { useUnitNavData } from '../../../modules/useUnitNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const UnitFetcher = ({ params, ...other }) => {
  const { navData } = useUnitNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
