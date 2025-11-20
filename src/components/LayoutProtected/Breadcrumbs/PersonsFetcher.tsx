import { usePersonsNavData } from '../../../modules/usePersonsNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const PersonsFetcher = ({ params, ...other }) => {
  const { navData } = usePersonsNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
