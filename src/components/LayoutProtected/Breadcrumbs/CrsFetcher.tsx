import { useCrsNavData } from '../../../modules/useCrsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const CrsFetcher = ({ params, ...other }) => {
  const { navData } = useCrsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
