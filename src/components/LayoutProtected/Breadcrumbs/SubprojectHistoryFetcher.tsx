import { useSubprojectHistoryNavData } from '../../../modules/useSubprojectHistoryNavData.ts'
import { FetcherReturner } from './FetcherReturner.tsx'

export const SubprojectHistoryFetcher = ({ params, ...other }) => {
  const { navData } = useSubprojectHistoryNavData(params)

  return (
    <FetcherReturner
      key={`${navData?.id ?? navData?.ownUrl}`}
      navData={navData}
      {...other}
    />
  )
}
