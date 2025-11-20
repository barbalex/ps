import { usePersonNavData } from '../../../modules/usePersonNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PersonFetcher = ({ params, ...other }) => {
  const { navData } = usePersonNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
